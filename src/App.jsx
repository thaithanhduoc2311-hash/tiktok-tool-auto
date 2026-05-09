import { useEffect, useState } from "react";
import "./App.css";
import MainPage from "./pages/App.jsx";
import LoginPage from "./pages/LoginPage.jsx";

function PublicInfoPage({ type }) {
  const isTerms = type === "terms";
  const appName = "Tool Upload AI";
  const title = isTerms ? "Terms of Service" : type === "privacy" ? "Privacy Policy" : appName;

  if (type === "about") {
    return (
      <div className="legal-page">
        <div className="legal-card">
          <h1>{appName}</h1>
          <p>
            Tool Upload AI is a web tool that helps authorized creators upload and publish their own short-form videos to their connected account.
          </p>
          <p>
            Users sign in, select a local video, add a caption, choose publishing settings, and explicitly confirm before the app sends the video for publishing.
          </p>
          <div className="legal-links">
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="legal-page">
      <article className="legal-card">
        <h1>{title}</h1>
        <p className="legal-updated">Last updated: May 5, 2026</p>

        {isTerms ? (
          <>
            <h2>Service</h2>
            <p>
              Tool Upload AI allows authorized users to upload and publish their own video content to a connected account. Users remain responsible for the content they select, caption, and publish.
            </p>
            <h2>User Consent</h2>
            <p>
              The service does not publish content automatically in the background. A user must sign in, select a video, configure the post, and click the publish button before a publishing request is sent.
            </p>
            <h2>Acceptable Use</h2>
            <p>
              Users must only upload content they own or have permission to use, and they must comply with applicable platform rules, intellectual property laws, and community guidelines.
            </p>
            <h2>Availability</h2>
            <p>
              The service is provided as is. Publishing may fail or be limited by platform permissions, review status, account settings, or API availability.
            </p>
          </>
        ) : (
          <>
            <h2>Information We Process</h2>
            <p>
              After a user signs in, Tool Upload AI may process basic profile information such as display name and avatar, access tokens needed to call authorized APIs, selected video files, captions, privacy settings, and publishing status responses.
            </p>
            <h2>How We Use Information</h2>
            <p>
              Information is used only to authenticate the user, show the connected account, upload user-selected videos, initialize publishing, and display success or error messages.
            </p>
            <h2>Storage</h2>
            <p>
              The frontend stores sign-in tokens and basic profile data in the user's browser local storage. Uploaded video files are temporarily processed by the backend for publishing and are deleted after the request completes or fails.
            </p>
            <h2>Sharing</h2>
            <p>
              User-selected content and authorized account data are sent to the platform APIs only as needed to complete the user's requested upload or publishing action. We do not sell personal data.
            </p>
          </>
        )}

        <h2>Contact</h2>
        <p>
          For questions about this app, contact the app owner using the contact details listed in the Developer Portal.
        </p>

        <div className="legal-links">
          <a href="/about">Website</a>
          <a href={isTerms ? "/privacy" : "/terms"}>{isTerms ? "Privacy Policy" : "Terms of Service"}</a>
        </div>
      </article>
    </div>
  );
}

export default function App() {
  const [isLogin, setIsLogin] = useState(() => {
    return !!localStorage.getItem("access_token");
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("tiktok_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authUrl, setAuthUrl] = useState("");
  const [isHandlingCallback, setIsHandlingCallback] = useState(() => {
    return new URLSearchParams(window.location.search).has("code");
  });
  const publicPath = window.location.pathname;

  const fetchAuthUrl = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/oauth/authorize");
      const data = await res.json();
      setAuthUrl(data.authorization_url);
    } catch (err) {
      console.error("Loi lay auth URL", err);
    }
  };

  const fetchUserInfo = async (accessToken) => {
    try {
      const res = await fetch("http://localhost:5000/api/oauth/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Get user info failed");
      }

      const nextUser = data.data?.user || data.user || data;
      setUser(nextUser);
      localStorage.setItem("tiktok_user", JSON.stringify(nextUser));
    } catch (err) {
      console.error("Loi lay thong tin user TikTok", err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      return;
    }

    let ignore = false;

    const exchangeCodeForToken = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            redirectUri: `${window.location.origin}/auth/callback`,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "OAuth token exchange failed");
        }

        localStorage.setItem("access_token", data.access_token);

        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        if (!ignore) {
          fetchUserInfo(data.access_token);
          setIsLogin(true);
          window.history.replaceState({}, "", "/");
        }
      } catch (err) {
        console.error("Loi xu ly OAuth callback", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("tiktok_user");

        if (!ignore) {
          setUser(null);
          setIsLogin(false);
        }
      } finally {
        if (!ignore) {
          setIsHandlingCallback(false);
        }
      }
    };

    exchangeCodeForToken();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isLogin || user || isHandlingCallback) {
      return;
    }

    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      return;
    }

    let ignore = false;

    const loadUserInfo = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/oauth/userinfo", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Get user info failed");
        }

        const nextUser = data.data?.user || data.user || data;

        if (!ignore) {
          setUser(nextUser);
          localStorage.setItem("tiktok_user", JSON.stringify(nextUser));
        }
      } catch (err) {
        console.error("Loi lay thong tin user TikTok", err);
      }
    };

    loadUserInfo();

    return () => {
      ignore = true;
    };
  }, [isHandlingCallback, isLogin, user]);

  useEffect(() => {
    if (!isLogin && !isHandlingCallback) {
      let ignore = false;

      const loadAuthUrl = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/oauth/authorize");
          const data = await res.json();

          if (!ignore) {
            setAuthUrl(data.authorization_url);
          }
        } catch (err) {
          console.error("Loi lay auth URL", err);
        }
      };

      loadAuthUrl();

      return () => {
        ignore = true;
      };
    }
  }, [isHandlingCallback, isLogin]);

  if (isHandlingCallback) {
    return (
      <div className="page login-page">
        <div className="login-hero">
          <p className="login-message">Dang xu ly dang nhap TikTok...</p>
        </div>
      </div>
    );
  }

  if (publicPath === "/terms" || publicPath === "/privacy" || publicPath === "/about") {
    return <PublicInfoPage type={publicPath.slice(1)} />;
  }

  if (!isLogin) {
    return (
      <LoginPage
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        authUrl={authUrl}
      />
    );
  }

  return (
    <MainPage
      isLogin={isLogin}
      setIsLogin={setIsLogin}
      authUrl={authUrl}
      onLogout={fetchAuthUrl}
      user={user}
      setUser={setUser}
    />
  );
}
