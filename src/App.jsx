import { useEffect, useState } from "react";
import "./App.css";
import MainPage from "./pages/App.jsx";
import LoginPage from "./pages/LoginPage.jsx";

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
