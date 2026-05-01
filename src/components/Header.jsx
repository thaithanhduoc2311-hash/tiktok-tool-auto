import { useEffect, useRef, useState } from "react";

const TIKTOK_LOGIN_URL = "http://localhost:5000/api/oauth/authorize";

export default function Header({
  isLogin,
  setIsLogin,
  authUrl,
  onLogout,
  user,
  setUser,
}) {
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarRef = useRef(null);
  const displayName = user?.display_name || "TikTok user";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setShowAvatarMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <img src="/logo.png" alt="Logo" className="header-logo" />
        <span className="header-title">TikTok Tool</span>
      </div>

      <div className="avatar-wrapper" ref={avatarRef}>
        {isLogin ? (
          <>
            <button
              type="button"
              className="user-chip"
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
            >
              <span className="user-greeting">Xin chào, {displayName}</span>
              <span className="avatar">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={displayName}
                    className="avatar-image"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </span>
            </button>

            {showAvatarMenu && (
              <div className="avatar-dropdown">
                <div
                  className="dropdown-item logout"
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    localStorage.removeItem("tiktok_user");
                    setUser?.(null);
                    setIsLogin(false);
                    setShowAvatarMenu(false);
                    onLogout?.();
                  }}
                >
                  <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        style={{ width: "18px", height: "18px" }}
                      >
                        <path d="M19 2a2 2 0 012 2v16a2 2 0 01-2 2H9a1 1 0 010-2h10V4H9a1 1 0 010-2h10ZM9.293 7.293a1 1 0 000 1.414L11.586 11H4a1 1 0 000 2h7.586l-2.293 2.293a1 1 0 101.414 1.414L15.414 12l-4.707-4.707a1 1 0 00-1.414 0Z" />
                      </svg>
                  Đăng xuất
                </div>
              </div>
            )}
          </>
        ) : (
          <a href={authUrl || TIKTOK_LOGIN_URL}>
            <button className="login-btn">Đăng nhập TikTok</button>
          </a>
        )}
      </div>
    </div>
  );
}
