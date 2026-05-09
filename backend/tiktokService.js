const axios = require("axios");
const FormData = require("form-data");

const TIKTOK_API_BASE = "https://open.tiktokapis.com";
const TIKTOK_UPLOAD_BASE = "https://open-upload.tiktokapis.com";

function getTikTokErrorMessage(error, fallbackMessage) {
  const responseData = error.response?.data;
  const apiError = responseData?.error;

  if (apiError?.message) {
    const code = apiError.code ? ` (${apiError.code})` : "";
    return `${fallbackMessage}: ${apiError.message}${code}`;
  }

  if (responseData?.message) {
    return `${fallbackMessage}: ${responseData.message}`;
  }

  return `${fallbackMessage}: ${error.message}`;
}

function attachTikTokErrorDetails(error, fallbackMessage) {
  const detailedError = new Error(getTikTokErrorMessage(error, fallbackMessage));
  detailedError.status = error.response?.status || 500;
  detailedError.details = error.response?.data;
  return detailedError;
}

/**
 * Initialize video upload to TikTok
 * @param {string} accessToken - User's access token
 * @param {object} sourceInfo - Source info (FILE_UPLOAD or PULL_FROM_URL)
 * @returns {Promise<object>} - Upload initialization response
 */
async function initializeVideoUpload(accessToken, sourceInfo) {
  try {
    const response = await axios.post(
      `${TIKTOK_API_BASE}/v2/post/publish/inbox/video/init/`,
      {
        source_info: sourceInfo,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw attachTikTokErrorDetails(error, "TikTok init upload failed");
  }
}

async function queryCreatorInfo(accessToken) {
  try {
    const response = await axios.post(
      `${TIKTOK_API_BASE}/v2/post/publish/creator_info/query/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw attachTikTokErrorDetails(error, "TikTok creator info query failed");
  }
}

async function initializeDirectPost(accessToken, postInfo, sourceInfo) {
  try {
    const response = await axios.post(
      `${TIKTOK_API_BASE}/v2/post/publish/video/init/`,
      {
        post_info: postInfo,
        source_info: sourceInfo,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw attachTikTokErrorDetails(error, "TikTok direct post init failed");
  }
}

/**
 * Upload video chunk to TikTok servers
 * @param {string} uploadUrl - The upload URL from initialization
 * @param {Buffer} videoBuffer - Video file buffer
 * @param {number} startByte - Start byte position
 * @param {number} endByte - End byte position
 * @param {number} totalSize - Total video size
 * @param {string} contentType - Video content type
 * @returns {Promise<object>} - Upload response
 */
async function uploadVideoChunk(
  uploadUrl,
  videoBuffer,
  startByte,
  endByte,
  totalSize,
  contentType = "video/mp4"
) {
  try {
    const response = await axios.put(uploadUrl, videoBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": endByte - startByte + 1,
        "Content-Range": `bytes ${startByte}-${endByte}/${totalSize}`,
      },
    });
    return response.data;
  } catch (error) {
    throw attachTikTokErrorDetails(error, "TikTok chunk upload failed");
  }
}

/**
 * Upload entire video file (handles chunking automatically)
 * @param {string} accessToken - User's access token
 * @param {string} videoPath - Path to video file
 * @param {number} chunkSize - Chunk size in bytes (default 5MB)
 * @returns {Promise<object>} - Upload result with publish_id
 */
function getUploadPlan(videoSize) {
  const maxWholeUploadSize = 64 * 1024 * 1024;
  const defaultChunkSize = 32 * 1024 * 1024;

  if (videoSize <= maxWholeUploadSize) {
    return {
      chunkSize: videoSize,
      totalChunks: 1,
    };
  }

  return {
    chunkSize: defaultChunkSize,
    totalChunks: Math.floor(videoSize / defaultChunkSize),
  };
}

async function uploadVideo(accessToken, videoPath, postInfo = {}) {
  const fs = require("fs");
  const path = require("path");

  // Get file stats
  const stats = fs.statSync(videoPath);
  const videoSize = stats.size;
  const uploadPlan = getUploadPlan(videoSize);

  // Determine content type
  const ext = path.extname(videoPath).toLowerCase();
  const contentTypeMap = {
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
  };
  const contentType = contentTypeMap[ext] || "video/mp4";

  if (postInfo.title && [...postInfo.title].length > 2200) {
    throw new Error("Caption qua dai. Direct Post cua TikTok chi cho phep toi da 2200 ky tu.");
  }

  const creatorInfo = await queryCreatorInfo(accessToken);
  if (creatorInfo.error && creatorInfo.error.code !== "ok") {
    throw new Error(`Creator info failed: ${creatorInfo.error.message || creatorInfo.error.code}`);
  }

  const privacyOptions = creatorInfo.data?.privacy_level_options || [];
  const privacyLevel = postInfo.privacy_level || "SELF_ONLY";
  const allowPublicDirectPost = process.env.TIKTOK_ALLOW_PUBLIC_DIRECT_POST === "true";

  if (!allowPublicDirectPost && privacyOptions.includes("PUBLIC_TO_EVERYONE")) {
    throw new Error(
      "Tai khoan TikTok dang o che do public. De test Direct Post khi app chua duoc audit, hay bat Private account trong app TikTok tren dien thoai, xoa quyen app cu, dang nhap lai roi thu lai."
    );
  }

  if (!privacyOptions.includes(privacyLevel)) {
    throw new Error(
      `Privacy level ${privacyLevel} khong hop le cho tai khoan nay. Cac lua chon hop le: ${privacyOptions.join(", ")}`
    );
  }

  const directPostInfo = {
    title: postInfo.title || "",
    privacy_level: privacyLevel,
    disable_duet: Boolean(postInfo.disable_duet),
    disable_comment: Boolean(postInfo.disable_comment),
    disable_stitch: Boolean(postInfo.disable_stitch),
    video_cover_timestamp_ms: postInfo.video_cover_timestamp_ms || 1000,
  };

  if (postInfo.is_aigc) {
    directPostInfo.is_aigc = true;
  }

  if (postInfo.brand_organic_toggle) {
    directPostInfo.brand_organic_toggle = true;
  }

  if (postInfo.brand_content_toggle) {
    directPostInfo.brand_content_toggle = true;
  }

  // Initialize direct post
  const initResponse = await initializeDirectPost(accessToken, directPostInfo, {
    source: "FILE_UPLOAD",
    video_size: videoSize,
    chunk_size: uploadPlan.chunkSize,
    total_chunk_count: uploadPlan.totalChunks,
  });

  if (initResponse.error && initResponse.error.code !== "ok") {
    throw new Error(`Init failed: ${initResponse.error.message}`);
  }

  const { upload_url, publish_id } = initResponse.data;

  // Read and upload video in chunks
  const fileBuffer = fs.readFileSync(videoPath);
  const totalChunks = uploadPlan.totalChunks;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * uploadPlan.chunkSize;
    const end = i === totalChunks - 1
      ? videoSize - 1
      : Math.min(start + uploadPlan.chunkSize, videoSize) - 1;
    const chunk = fileBuffer.slice(start, end + 1);

    await uploadVideoChunk(
      upload_url,
      chunk,
      start,
      end,
      videoSize,
      contentType
    );

    console.log(`Uploaded chunk ${i + 1}/${totalChunks}`);
  }

  return {
    publish_id,
    upload_url,
    privacy_level: privacyLevel,
    message: "Video sent to TikTok for direct posting",
  };
}

/**
 * Pull video from URL (alternative method)
 * @param {string} accessToken - User's access token
 * @param {string} videoUrl - URL of the video to pull
 * @returns {Promise<object>} - Upload result with publish_id
 */
async function pullVideoFromUrl(accessToken, videoUrl) {
  const initResponse = await initializeVideoUpload(accessToken, {
    source: "PULL_FROM_URL",
    video_url: videoUrl,
  });

  if (initResponse.error && initResponse.error.code !== "ok") {
    throw new Error(`Init failed: ${initResponse.error.message}`);
  }

  return {
    publish_id: initResponse.data.publish_id,
    message: "Video pull initiated successfully",
  };
}

/**
 * Get upload status
 * @param {string} accessToken - User's access token
 * @param {string} publishId - The publish_id from upload
 * @returns {Promise<object>} - Status response
 */
async function getUploadStatus(accessToken, publishId) {
  try {
    const response = await axios.get(
      `${TIKTOK_API_BASE}/v2/post/publish/inbox/status/get/`,
      {
        params: { publish_id: publishId },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw attachTikTokErrorDetails(error, "TikTok status check failed");
  }
}

module.exports = {
  initializeVideoUpload,
  initializeDirectPost,
  queryCreatorInfo,
  uploadVideoChunk,
  uploadVideo,
  pullVideoFromUrl,
  getUploadStatus,
};
