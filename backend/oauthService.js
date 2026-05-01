const axios = require("axios");

const TIKTOK_API_BASE = "https://open.tiktokapis.com";

function getAuthorizationUrl(clientKey, redirectUri, state = "") {
  const params = new URLSearchParams({
    client_key: clientKey,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user.info.basic,video.upload",
    state: state,
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

async function getAccessToken(clientKey, clientSecret, code, redirectUri) {
  try {
    const response = await axios.post(
      `${TIKTOK_API_BASE}/v2/oauth/token/`,
      new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ OAuth Token Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "OAuth failed");
  }
}

async function refreshAccessToken(clientKey, clientSecret, refreshToken) {
  try {
    const response = await axios.post(
      `${TIKTOK_API_BASE}/v2/oauth/token/`,
      new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Refresh Token Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Refresh failed");
  }
}

async function getUserInfo(accessToken) {
  try {
    const response = await axios.get(`${TIKTOK_API_BASE}/v2/user/info/`, {
      params: {
        fields: "open_id,union_id,avatar_url,display_name",
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ User Info Error:", error.response?.data || error.message);
    throw new Error("Get user info failed");
  }
}

module.exports = {
  getAuthorizationUrl,
  getAccessToken,
  refreshAccessToken,
  getUserInfo,
};
