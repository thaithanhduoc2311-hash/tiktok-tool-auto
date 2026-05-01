const axios = require("axios");
const FormData = require("form-data");

const TIKTOK_API_BASE = "https://open.tiktokapis.com";
const TIKTOK_UPLOAD_BASE = "https://open-upload.tiktokapis.com";

/**
 * Initialize video upload to TikTok
 * @param {string} accessToken - User's access token
 * @param {object} sourceInfo - Source info (FILE_UPLOAD or PULL_FROM_URL)
 * @returns {Promise<object>} - Upload initialization response
 */
async function initializeVideoUpload(accessToken, sourceInfo) {
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
  const response = await axios.put(uploadUrl, videoBuffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": endByte - startByte + 1,
      "Content-Range": `bytes ${startByte}-${endByte}/${totalSize}`,
    },
  });
  return response.data;
}

/**
 * Upload entire video file (handles chunking automatically)
 * @param {string} accessToken - User's access token
 * @param {string} videoPath - Path to video file
 * @param {number} chunkSize - Chunk size in bytes (default 5MB)
 * @returns {Promise<object>} - Upload result with publish_id
 */
async function uploadVideo(accessToken, videoPath, chunkSize = 5 * 1024 * 1024) {
  const fs = require("fs");
  const path = require("path");

  // Get file stats
  const stats = fs.statSync(videoPath);
  const videoSize = stats.size;
  const fileName = path.basename(videoPath);

  // Determine content type
  const ext = path.extname(videoPath).toLowerCase();
  const contentTypeMap = {
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
  };
  const contentType = contentTypeMap[ext] || "video/mp4";

  // Initialize upload
  const initResponse = await initializeVideoUpload(accessToken, {
    source: "FILE_UPLOAD",
    video_size: videoSize,
    chunk_size: chunkSize,
    total_chunk_count: Math.ceil(videoSize / chunkSize),
  });

  if (initResponse.error && initResponse.error.code !== "ok") {
    throw new Error(`Init failed: ${initResponse.error.message}`);
  }

  const { upload_url, publish_id } = initResponse.data;

  // Read and upload video in chunks
  const fileBuffer = fs.readFileSync(videoPath);
  const totalChunks = Math.ceil(videoSize / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, videoSize) - 1;
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
    message: "Video uploaded successfully",
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
}

module.exports = {
  initializeVideoUpload,
  uploadVideoChunk,
  uploadVideo,
  pullVideoFromUrl,
  getUploadStatus,
};