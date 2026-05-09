import Header from "../components/Header";

export default function LoginPage({ isLogin, setIsLogin, authUrl }) {
  return (
    <div className="page login-page">
      <Header
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        authUrl={authUrl}
      />

      <div className="login-hero" style={{ padding: 40 }}>
        {/* Trang trắng */}        
        <img src="/non-login.svg" alt="Tool Upload AI" className="login-hero-image" />
        <p className="login-message">Bạn chưa đăng nhập TikTok</p>
      </div>
    </div>
  );
}
