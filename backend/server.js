const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const {
  uploadVideo,
  pullVideoFromUrl,
  getUploadStatus,
} = require("./tiktokService");

const {
  getAuthorizationUrl,
  getAccessToken,
  refreshAccessToken,
  getUserInfo,
} = require("./oauthService");

const app = express();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `video_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/quicktime", "video/webm"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only MP4, MOV, WebM allowed."));
    }
  },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (req, res) => {
  res.send("TikTok backend running...");
});

/**
 * POST /api/upload/video
 * Upload video file to TikTok
 * Body: { accessToken: string, video: file }
 */
app.post("/api/upload/video", upload.single("video"), async (req, res) => {
  try {
    const { accessToken } = req.body;
    const videoFile = req.file;

    if (!accessToken) {
      return res.status(400).json({ error: "Missing accessToken" });
    }

    if (!videoFile) {
      return res.status(400).json({ error: "No video file provided" });
    }

    const result = await uploadVideo(accessToken, videoFile.path);

    // Clean up uploaded file after processing
    fs.unlinkSync(videoFile.path);

    res.json(result);
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/upload/url
 * Pull video from URL to TikTok
 * Body: { accessToken: string, videoUrl: string }
 */
app.post("/api/upload/url", async (req, res) => {
  try {
    const { accessToken, videoUrl } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: "Missing accessToken" });
    }

    if (!videoUrl) {
      return res.status(400).json({ error: "Missing videoUrl" });
    }

    const result = await pullVideoFromUrl(accessToken, videoUrl);

    res.json(result);
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/upload/status/:publishId
 * Get upload status
 * Headers: { Authorization: Bearer <accessToken> }
 */
app.get("/api/upload/status/:publishId", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const accessToken = authHeader.replace("Bearer ", "");
    const { publishId } = req.params;

    const result = await getUploadStatus(accessToken, publishId);

    res.json(result);
  } catch (error) {
    console.error("Status check error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/oauth/authorize
 * Get TikTok OAuth authorization URL
 * Query params: { redirectUri: string, state: string }
 */
app.get("/api/oauth/authorize", (req, res) => {
  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;

    const authUrl = getAuthorizationUrl(clientKey, redirectUri);

    res.json({ authorization_url: authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/oauth/token
 * Exchange authorization code for access token
 * Body: { code: string, redirectUri: string }
 */
app.post("/api/oauth/token", async (req, res) => {
  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const { code, redirectUri } = req.body;

    if (!clientKey || !clientSecret) {
      return res.status(500).json({ error: "OAuth credentials not configured" });
    }

    if (!code || !redirectUri) {
      return res.status(400).json({ error: "Missing code or redirectUri" });
    }

    const tokenData = await getAccessToken(clientKey, clientSecret, code, redirectUri);

    res.json(tokenData);
  } catch (error) {
    console.error("Token exchange error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/oauth/refresh
 * Refresh access token
 * Body: { refreshToken: string }
 */
app.post("/api/oauth/refresh", async (req, res) => {
  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const { refreshToken } = req.body;

    if (!clientKey || !clientSecret) {
      return res.status(500).json({ error: "OAuth credentials not configured" });
    }

    if (!refreshToken) {
      return res.status(400).json({ error: "Missing refreshToken" });
    }

    const tokenData = await refreshAccessToken(clientKey, clientSecret, refreshToken);

    res.json(tokenData);
  } catch (error) {
    console.error("Token refresh error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/oauth/userinfo
 * Get user profile info
 * Headers: { Authorization: Bearer <accessToken> }
 */
app.get("/api/oauth/userinfo", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const accessToken = authHeader.replace("Bearer ", "");
    const userInfo = await getUserInfo(accessToken);

    res.json(userInfo);
  } catch (error) {
    console.error("User info error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});