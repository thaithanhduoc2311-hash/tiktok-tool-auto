import Header from "../components/Header";
import React, { useRef, useState, useEffect } from "react";

export default function App({ isLogin, setIsLogin, authUrl, onLogout, user, setUser }) {
  const fileRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postPopup, setPostPopup] = useState(null);
  const locationRef = useRef(null);
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [caption, setCaption] = useState("");
  // showTooltip: false | 'cover' | 'location'
  const [showTooltip, setShowTooltip] = useState(false);

  const [location, setLocation] = useState("");
  const [showLocationBox, setShowLocationBox] = useState(false);
  // THÊM STATE
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [showLinkPopupStep2, setShowLinkPopupStep2] = useState(false);
  const [activeTab, setActiveTab] = useState("shop");
  const [scheduleType, setScheduleType] = useState("now"); // now | schedule

  const [showTime, setShowTime] = useState(false);
  const [showDate, setShowDate] = useState(false);

  const previewVideoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const togglePlay = () => {
  const v = previewVideoRef.current;
  if (!v) return;

  if (v.paused) {
    v.play();
    setIsPlaying(true);
  } else {
    v.pause();
    setIsPlaying(false);
  }
};

const handleLoaded = () => {
  const v = previewVideoRef.current;
  if (!v) return;
  setDuration(v.duration || 0);
};

const handleTimeUpdate = () => {
  const v = previewVideoRef.current;
  if (!v) return;
  setCurrentTime(v.currentTime);
};

const seekVideo = (e) => {
  const v = previewVideoRef.current;
  if (!v) return;

  const val = Number(e.target.value);
  v.currentTime = val;
  setCurrentTime(val);
};

const changeVolume = (e) => {
  const v = previewVideoRef.current;
  if (!v) return;

  const val = Number(e.target.value);
  v.volume = val;
  setVolume(val);
};

const fullScreenVideo = () => {
  const v = previewVideoRef.current;
  if (v?.requestFullscreen) v.requestFullscreen();
};

const formatTime = (sec) => {
  if (!sec) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
// Tính thời gian hiện tại + 15 phút, làm tròn đến phút gần nhất chia hết cho 5
const getDefaultTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  const minutes = now.getMinutes();
  const roundedMinutes = Math.round(minutes / 5) * 5;
  now.setMinutes(roundedMinutes % 60);
  if (roundedMinutes >= 60) {
    now.setHours(now.getHours() + 1);
  }
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${mins}`;
};

const getDefaultDate = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const [time, setTime] = useState(getDefaultTime);
const [date, setDate] = useState(getDefaultDate);

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
const hourRef = useRef(null);
const minuteRef = useRef(null);

const ITEM_HEIGHT = 36;

const [showPrivacy, setShowPrivacy] = useState(false);
const [privacy, setPrivacy] = useState("Chỉ mình bạn");

  // Khai báo nội dung bài đăng
  const [showBrandDeclare, setShowBrandDeclare] = useState(false);
  const [isBrand, setIsBrand] = useState(false);
  const [isBrandContent, setIsBrandContent] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

const [currentDate, setCurrentDate] = useState(new Date());
const [selectedDate, setSelectedDate] = useState(new Date());

const locations = [
  {
    name: "8h chicago",
    address: "Tu Quan, Yen Son, Tuyen Quang, Vietnam",
  },
  {
    name: "Vung Tau Beach",
    address: "Beach Road, Phường 8, Vũng Tàu",
  },
  {
    name: "Vùng Ăn Chơi",
    address: "Huế, Việt Nam",
  },
  {
    name: "Thanh Hoa Travel",
    address: "Thanh Hóa, Việt Nam",
  },
  {
    name: "Kênh T7 (Từ VCT đến Bobo)",
    address: "Long Thạnh",
  },
  {
    name: "Quảng Trường Lấn Biển Đảo Phú Gia",
    address: "Rạch Giá, Kiên Giang",
  },
  {
    name: "Công Viên Tượng Đài Long An",
    address: "Tân An, Long An",
  },
  {
    name: "Trại Cá Giống Ba So",
    address: "Tân An, Long An",
  },
  {
    name: "Aeon Mall Tân An",
    address: "Tân An, Long An",
  },
];

const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];

  // ngày trống đầu tháng
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // ngày trong tháng
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
};

const changeMonth = (step) => {
  const newDate = new Date(currentDate);
  newDate.setMonth(currentDate.getMonth() + step);
  setCurrentDate(newDate);
};

const formatDateVN = (dateStr) => {
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
};

const handleScrollHour = () => {
  const el = hourRef.current;
  if (!el) return;

  const index = Math.round(el.scrollTop / ITEM_HEIGHT);
  const hour = String(index).padStart(2, "0");

  setTime((prev) => `${hour}:${prev.split(":")[1]}`);
};

const handleScrollMinute = () => {
  const el = minuteRef.current;
  if (!el) return;

  const index = Math.round(el.scrollTop / ITEM_HEIGHT);
  const minute = String(minutes[index] ?? 0).padStart(2, "0");

  setTime((prev) => `${prev.split(":")[0]}:${minute}`);
};

const scroll = (direction) => {
  const el = carouselRef.current;
  if (!el) return;

  const scrollAmount = 150;

  el.scrollBy({
    left: direction === "right" ? scrollAmount : -scrollAmount,
    behavior: "smooth",
  });

  setTimeout(checkScrollButtons, 300);
};

  const checkScrollButtons = () => {
  const el = carouselRef.current;
  if (!el) return;

  setCanScrollLeft(el.scrollLeft > 5);

  setCanScrollRight(
    el.scrollLeft + el.clientWidth < el.scrollWidth - 5
  );
};

const selectLocation = (item) => {
  setLocation(item.name);
  setShowLocationBox(false);
};

const showPostPopup = (type, title, message) => {
  setPostPopup({ type, title, message });
};

const readUploadResponse = async (res) => {
  const text = await res.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
};

const getUploadErrorMessage = (err) => {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return "Không kết nối được backend upload. Hãy kiểm tra server backend đang chạy ở http://localhost:5000, sau đó thử lại.";
  }

  return err.message || "Có lỗi không xác định khi đăng video.";
};

const getUploadResponseErrorMessage = (data, status) => {
  const apiError = data.details?.error;
  const message = data.error || data.message || `Upload failed (${status})`;
  const parts = [message];

  if (apiError?.code) {
    parts.push(`Code: ${apiError.code}`);
  }

  if (apiError?.log_id) {
    parts.push(`Log ID: ${apiError.log_id}`);
  }

  return parts.join("\n");
};

const getPrivacyLevel = (value) => {
  const normalized = value.toLowerCase();

  if (normalized.includes("mình") || normalized.includes("mÃ¬nh") || normalized.includes("minh")) {
    return "SELF_ONLY";
  }

  if (normalized.includes("bạn") || normalized.includes("bÃ¨") || normalized.includes("ban")) {
    return "MUTUAL_FOLLOW_FRIENDS";
  }

  return "PUBLIC_TO_EVERYONE";
};

/*
const fetchAuthUrl = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/tiktok/login");
    const data = await res.json();

    setAuthUrl(data.authorization_url);
  } catch (err) {
    console.error("Lỗi lấy auth URL", err);
  }
};
*/

useEffect(() => {
/*
if (!isLogin) {
    const loadAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/tiktok/login");
        const data = await res.json();
        setAuthUrl(data.authorization_url);
      } catch (err) {
        console.error(err);
      }
    };

    loadAuth();
  }
*/

  const el = carouselRef.current;
  if (el) {
    checkScrollButtons();
    el.addEventListener("scroll", checkScrollButtons);
  }

  const handleClickOutside = (event) => {
    // LOCATION
    if (
      locationRef.current &&
      !locationRef.current.contains(event.target)
    ) {
      setShowLocationBox(false);
    }

    // TIME PICKER
    // TIME
    if (!event.target.closest(".time-wrapper")) {
      setShowTime(false);
    }

    // DATE
    if (
      !event.target.closest(".date-box") &&
      !event.target.closest(".picker-popup")
    ) {
      setShowDate(false);
    }

    // PRIVACY DROPDOWN
    if (!event.target.closest(".privacy-selected") && !event.target.closest(".privacy-dropdown")) {
      setShowPrivacy(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    if (el) {
      el.removeEventListener("scroll", checkScrollButtons);
    }

    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isLogin]);

  const handleChoose = () => {
    fileRef.current.click();
  };

const handleFile = (e) => {
  const file = e.target.files[0];
  if (file) {
    setSelectedFile(file);
    setVideo(URL.createObjectURL(file));

    setFileInfo({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
    });
  }
};

 const handleDrop = (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];

  if (file) {
    setSelectedFile(file);
    setVideo(URL.createObjectURL(file));

    setFileInfo({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
    });
  }
};

const handlePost = async () => {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    const message = "Bạn cần đăng nhập Tiktok trước khi đăng video.";
    showPostPopup("error", "Chưa đăng nhập", message);
    return;
  }

  if (!selectedFile) {
    const message = "Vui lòng chọn video trước khi đăng.";
    showPostPopup("error", "Chưa chọn video", message);
    return;
  }

  try {
    setIsPosting(true);
    const formData = new FormData();
    formData.append("accessToken", accessToken);
    formData.append("title", caption.trim());
    formData.append("privacyLevel", getPrivacyLevel("minh"));
    formData.append("disableDuet", "false");
    formData.append("disableComment", "false");
    formData.append("disableStitch", "false");
    formData.append("isAigc", String(isAiGenerated));
    formData.append("brandOrganicToggle", String(showBrandDeclare && isBrand));
    formData.append("brandContentToggle", String(showBrandDeclare && isBrandContent));
    formData.append("video", selectedFile);

    const res = await fetch("http://localhost:5000/api/upload/video", {
      method: "POST",
      body: formData,
    });
    const data = await readUploadResponse(res);

    if (!res.ok) {
      throw new Error(getUploadResponseErrorMessage(data, res.status));
    }

    const message = `Đã gửi video để TikTok đăng thẳng lên profile ở chế độ riêng tư. Publish ID: ${data.publish_id}`;
    showPostPopup("success", "Đăng video thành công", message);
  } catch (err) {
    console.error("Upload TikTok error", err);
    const message = getUploadErrorMessage(err);
    showPostPopup("error", "Đăng video thất bại", message);
  } finally {
    setIsPosting(false);
  }
};

  return (
    <div className="page">
      {/* Main */}
      <main className="main">
        {/* Header */}        
        <Header
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          authUrl={authUrl}
          onLogout={onLogout}
          user={user}
          setUser={setUser}
        />
        {/*
          <>

                {showAvatarMenu && (
                  <div className="avatar-dropdown">
                    <div
                      className="dropdown-item logout"
                      onClick={() => {
                        localStorage.removeItem("access_token");
                        setIsLogin(false);
                        setShowAvatarMenu(false);
                        fetchAuthUrl(); // lấy lại link login
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
        */}
              {/*
                <button className="login-btn">Đăng nhập TikTok</button>
              </a>
            )}
          </div>
              */}

        {/* Content */}
        <div className="content">
          {/* Left */}
          <div className="left">
            {/* Upload Card */}
            <div className="card">
              <h3>Tải video lên</h3>

              <div
                className="drop-zone"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {video ? (
                <div className="uploaded-box">
                  <div className="file-name">{fileInfo?.name}</div>

                  <div className="file-status" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" role="img" focusable="false" data-icon="check-circle-fill" aria-hidden="true" fill="currentColor" will-change="auto" transform="rotate(0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.999c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10m4.707 8.708a1 1 0 0 0-1.414-1.414L11 13.586l-2.293-2.293a1 1 0 1 0-1.414 1.414l2.823 2.823a1.25 1.25 0 0 0 1.768 0z"></path></svg>Đã tải lên ({fileInfo?.size}MB)
                  </div>

                  <button
                    className="replace-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                    onClick={handleChoose}
                  ><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" role="img" focusable="false" data-icon="arrow-repeat" aria-hidden="true" fill="currentColor" will-change="auto" transform="rotate(0)"><path d="M12 3a9 9 0 0 0-5.594 1.938A1 1 0 1 0 7.656 6.5 6.97 6.97 0 0 1 12 5a7 7 0 0 1 7 7h-1a.5.5 0 0 0-.4.8l2 2.667a.5.5 0 0 0 .8 0l2-2.667a.5.5 0 0 0-.4-.8h-1a9 9 0 0 0-9-9M4.4 8.533a.5.5 0 0 0-.8 0l-2 2.667a.5.5 0 0 0 .4.8h1a9 9 0 0 0 9 9 9 9 0 0 0 5.594-1.938 1 1 0 1 0-1.25-1.562A6.96 6.96 0 0 1 12 19a7 7 0 0 1-7-7h1a.5.5 0 0 0 .4-.8z"></path></svg>
                    Thay thế
                  </button>
                </div>
              ) : (
                  <>
                    <p>Kéo thả video vào đây</p>
                    <button onClick={handleChoose}>Chọn file</button>
                  </>
                )}

                <input
                  type="file"
                  ref={fileRef}
                  hidden
                  accept="video/*"
                  onChange={handleFile}
                />
              </div>
            </div>

            {/* Caption */}
            <div className="card">
              <h3>Mô tả</h3>
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Chia sẻ thông tin về video của bạn, sử dụng hashtag # hoặc nhắc đến @ để tăng khả năng tiếp cận."
                  style={{ width: '100%', minHeight: 200, paddingBottom: 36, background: '#f5f5f5', border: 'none', borderRadius: 12, fontSize: 16, color: '#222', resize: 'none' }}
                  maxLength={4000}
                />
                {/* Nút chèn hashtag và nhắc đến */}
                <div style={{ position: 'absolute', left: 16, bottom: 8, display: 'flex', gap: 18 }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#888', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => setCaption(caption + (caption && !caption.endsWith(' ')? ' #':'#'))}
                  >
                    <span style={{ fontSize: 14 }}>#</span> Hashtag
                  </button>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#888', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => setCaption(caption + (caption && !caption.endsWith(' ')? ' @':'@'))}
                  >
                    <span style={{ fontSize: 14 }}>@</span> Nhắc đến
                  </button>
                </div>
                {/* Bộ đếm ký tự */}
                <span style={{ position: 'absolute', right: 18, bottom: 8, color: '#aaa', fontSize: 14 }}>{caption.length}/4000</span>
              </div>

              {/* Ảnh bìa */}
              <div className="cover-section">
                <div className="cover-label-row">
                  <label style={{ fontWeight: 500, fontSize: 18 }}>Ảnh bìa </label>
                  <span
                    style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                    onMouseEnter={() => setShowTooltip('cover')}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" role="img" focusable="false" data-icon="info" aria-hidden="true" fill="var(--ui-text-placeholder)" will-change="auto" transform="rotate(0)"><path opacity="0.989" d="M11.999 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10m0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16m0 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-1 3a1 1 0 0 0-1 1c0 .482.359.842.812.938l-.593 2.874c-.232 1.161.598 2.188 1.78 2.188h1a1 1 0 0 0 0-2h-.78l.75-3.812a.986.986 0 0 0-.97-1.188z"></path></svg>
                    {showTooltip === 'cover' && (
                      <span style={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '150%', top: '50%', transform: 'translateY(-50%)', zIndex: 20 }}>
                        {/* Mũi tên nhỏ hướng sang phải */}
                        <span style={{
                          position: 'absolute',
                          left: '-7px',
                          top: '50%',
                          transform: 'translateY(-50%) rotate(45deg)',
                          width: '14px',
                          height: '14px',
                          background: 'rgba(95,95,95,0.58)',
                          borderRadius: '3px',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                        }} />
                        <span style={{
                          position: 'relative',
                          background: 'rgba(95,95,95,0.58)',
                          color: '#fff',
                          padding: '12px 14px',
                          borderRadius: '14px',
                          minWidth: '400px',
                          fontSize: '15px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.10)',
                        }}>
                          Chọn hoặc tải ảnh bìa lên từ thiết bị của bạn. Ảnh bìa đẹp có thể thu hút sự quan tâm của người xem một cách hiệu quả
                        </span>
                      </span>
                    )}
                  </span>
                </div>
                <div className="cover-thumb-row">
                  <div className="cover-thumb">
                    {/* Hiển thị ảnh bìa nếu có */}
                    <img
                      src={null}
                      alt="Ảnh bìa"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'none' }}
                    />
                    {/* Placeholder */}
                    <span style={{ color: '#fff', fontSize: 12 }}>No Image</span>
                    <button className="cover-btn">Sửa ảnh bìa</button>
                  </div>
                </div>
              </div>
              {/* Vị trí */}
              <div className="location-section">
                <div className="location-label-row">
                  <label style={{ fontWeight: 500, fontSize: 18 }}>Vị trí</label>
                  <span
                    style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                    onMouseEnter={() => setShowTooltip('location')}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" role="img" focusable="false" data-icon="info" aria-hidden="true" fill="var(--ui-text-placeholder)" will-change="auto" transform="rotate(0)"><path opacity="0.989" d="M11.999 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10m0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16m0 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-1 3a1 1 0 0 0-1 1c0 .482.359.842.812.938l-.593 2.874c-.232 1.161.598 2.188 1.78 2.188h1a1 1 0 0 0 0-2h-.78l.75-3.812a.986.986 0 0 0-.97-1.188z"></path></svg>
                    {showTooltip === 'location' && (
                      <span style={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '150%', top: '50%', transform: 'translateY(-50%)', zIndex: 20 }}>
                        {/* Mũi tên nhỏ hướng sang phải */}
                        <span style={{
                          position: 'absolute',
                          left: '-7px',
                          top: '50%',
                          transform: 'translateY(-50%) rotate(45deg)',
                          width: '14px',
                          height: '14px',
                          background: 'rgba(95,95,95,0.58)',
                          borderRadius: '3px',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                        }} />
                        <span style={{
                          position: 'relative',
                          background: 'rgba(95,95,95,0.58)',
                          color: '#fff',
                          padding: '12px 14px',
                          borderRadius: '14px',
                          minWidth: '400px',
                          fontSize: '15px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.10)',
                        }}>
                          Địa chỉ IP của bạn được sử dụng để gợi ý các vị trí trong khu vực của bạn
                        </span>
                      </span>
                    )}
                  </span>
                </div>

                <div ref={locationRef} style={{ position: "relative" }}>
                  {/* Dropdown */}
                  {showLocationBox && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "40px",
                        left: 0,
                        width: "420px",
                        height: "350px",
                        background: "#fff",
                        borderRadius: "14px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                        padding: "12px",
                        zIndex: 50,
                        overflowY: "auto",
                        overflowX: "hidden",
                      }}
                    >
                      {locations.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => selectLocation(item)}
                          style={{
                            padding: "5px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            marginBottom: "6px",
                            background: i === 1 ? "#f5f5f5" : "transparent",
                          }}
                        >
                          <div style={{ fontSize: 14 }}>{item.name}</div>
                          <div style={{ color: "#888", fontSize: 14 }}>
                            {item.address}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ô search */}
                  <div
                    onClick={() => setShowLocationBox(!showLocationBox)}
                    style={{
                      height: "40px",
                      border: "1px solid #ccc",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 18px",
                      cursor: "pointer",
                      justifyContent: "space-between",
                      width:"350px",
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" role="img" focusable="false" data-icon="cursor" aria-hidden="true" fill="#00000057" will-change="auto" transform="rotate(0)"><path d="M4.667 3.034c.473-.046 1.022.033 1.625.28l13.125 5.408c1.01.393 1.563.82 1.563 1.812v.125c0 1.01-.818 1.706-1.781 1.844l-5.407 1.312-1.281 5.376c-.123.982-.85 1.812-1.875 1.812h-.125c-.991 0-1.412-.565-1.812-1.594L3.292 6.315c-.745-1.81-.041-3.142 1.375-3.281m.313 1.969c-.041.04-.002.178.156.562l5.406 13.126c.009.022.024.01.032.03l1.437-5.968a.96.96 0 0 1 .719-.72l5.937-1.436c-.428-.176-13.125-5.438-13.125-5.438-.384-.158-.521-.197-.562-.156"></path></svg>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Tìm kiếm vị trí"
                        style={{
                          border: "none",
                          outline: "none",
                          fontSize: 15,
                          width: "260px",
                        }}
                      />
                    </div>

                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        transition: "0.2s",
                        transform: showLocationBox
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="#222"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Gợi ý phía dưới - Carousel */}
                <div className="suggestion-carousel-wrapper">
                  {canScrollLeft && (
                    <button
                      className="carousel-btn left"
                      onClick={() => scroll("left")}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M15 6l-6 6 6 6"
                          stroke="#222"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}

                  <div className="suggestion-carousel" ref={carouselRef}>
                    {locations.map((item, idx) => (
                      <div
                        className="suggestion-item"
                        key={idx}
                        onClick={() => selectLocation(item)}
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>

                  {canScrollRight && (
                    <button
                      className="carousel-btn right"
                      onClick={() => scroll("right")}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M9 6l6 6-6 6"
                          stroke="#222"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}

                </div>
              </div>

              {/* Thêm liên kết */}
              <div style={{ marginTop: 28 }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 18,
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  Thêm liên kết
                </label>

                <button
                  style={{
                    width: "320px",
                    height: "40px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#f1f1f1",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                  onClick={() => setShowLinkPopup(true)}
                >
                  ＋ Thêm
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="card">
              <h3 style={{marginBottom: 5 }}>Cài đặt</h3>
              
              {/* THỜI ĐIỂM ĐĂNG */}
              <div className="setting-group">
                <label style={{fontSize: 14 }}>Thời điểm đăng</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500 }}>
                    <input
                      type="radio"
                      checked={scheduleType === "now"}
                      onChange={() => setScheduleType("now")}
                      style={{ accentColor: '#fe2c55', width: 14, height: 14 }}
                    />
                    <span>Bây giờ</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500 }}>
                    <input
                      type="radio"
                      checked={scheduleType === "schedule"}
                      onChange={() => setScheduleType("schedule")}
                      style={{ accentColor: '#fe2c55', width: 14, height: 14 }}
                    />
                    <span
                    style={{ cursor: 'pointer', position: 'relative', display: 'inline-flex' }}
                    onMouseEnter={() => setShowTooltip('pickertime')}
                    onMouseLeave={() => setShowTooltip(false)}
                  > Lên lịch
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" role="img" focusable="false" data-icon="info" aria-hidden="true" fill="var(--ui-text-placeholder)" will-change="auto" transform="rotate(5)"><path opacity="0.989" d="M11.999 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10m0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16m0 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-1 3a1 1 0 0 0-1 1c0 .482.359.842.812.938l-.593 2.874c-.232 1.161.598 2.188 1.78 2.188h1a1 1 0 0 0 0-2h-.78l.75-3.812a.986.986 0 0 0-.97-1.188z"></path></svg>
                    {showTooltip === 'pickertime' && (
                      <span style={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '115%', top: '40%', transform: 'translateY(-50%)', zIndex: 20 }}>
                        {/* Mũi tên nhỏ hướng sang phải */}
                        <span style={{
                          position: 'absolute',
                          left: '-7px',
                          top: '50%',
                          transform: 'translateY(-50%) rotate(45deg)',
                          width: '14px',
                          height: '14px',
                          background: 'rgba(95,95,95,0.58)',
                          borderRadius: '3px',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                        }} />
                        <span style={{
                          position: 'relative',
                          background: 'rgba(95,95,95,0.58)',
                          color: '#fff',
                          padding: '12px 14px',
                          borderRadius: '14px',
                          minWidth: '400px',
                          fontSize: '15px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.10)',
                        }}>
                          Bằng cách lên lịch cho video, bạn cho phép video của mình được tải lên và lưu trữ trên máy chủ của Tiktok trước khi đăng
                        </span>
                      </span>
                    )}
                  </span>
                  </label>
                </div>
                {scheduleType === "schedule" && (
                  <div className="time-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                    <div
                      className="time-box"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTime(true);
                      }}
                      style={{ minWidth: 90, cursor: 'pointer', border: '1px solid #eee', borderRadius: 10, padding: '7px 16px', background: '#fafbfc', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}
                    >
                      <svg width="14" height="14" fill="#a0a0a0" viewBox="0 0 24 24"><path d="M12 8v5h5M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                      {time}
                      {showTime && (
                      <div
                        className="picker-popup time-popup"
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 38,
                          zIndex: 9999,
                          background: "#fff",
                          borderRadius: 12,
                          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                          display: "flex",
                          overflow: "hidden",
                          height: 180,
                        }}
                      >
                        {/* CỘT GIỜ */}
                        <div
                          className="time-column"
                          ref={hourRef}
                          onScroll={handleScrollHour}
                        >
                          {hours.map((h) => {
                            const val = String(h).padStart(2, "0");
                            return (
                              <div key={h} className="time-cell">
                                {val}
                              </div>
                            );
                          })}
                        </div>

                        {/* dấu : */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 20,
                            fontWeight: 600,
                          }}
                        >
                          :
                        </div>

                        {/* CỘT PHÚT */}
                        <div
                          className="time-column"
                          ref={minuteRef}
                          onScroll={handleScrollMinute}
                        >
                          {minutes.map((m) => {
                            const val = String(m).padStart(2, "0");
                            return (
                              <div key={m} className="time-cell">
                                {val}
                              </div>
                            );
                          })}
                        </div>

                        {/* VÙNG SELECT Ở GIỮA */}
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            right: 0,
                            height: 36,
                            transform: "translateY(-50%)",
                            borderTop: "1px solid #ddd",
                            borderBottom: "1px solid #ddd",
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                    )}
                    </div>
                    <div
                      className="date-box"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDate(true);
                      }}
                      style={{ minWidth: 120, cursor: 'pointer', border: '1px solid #eee', borderRadius: 10, padding: '7px 16px', background: '#fafbfc', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}
                    >
                      <svg width="14" height="14" fill="#a0a0a0" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" stroke="#a0a0a0" strokeWidth="2" fill="none"/><path d="M16 3v4M8 3v4M3 9h18" stroke="#a0a0a0" strokeWidth="2"/></svg>
                      {formatDateVN(date)}
                      {showDate && (
                        <div className="calendar-popup">
                          {/* HEADER */}
                          <div className="calendar-header">
                            <button onClick={() => changeMonth(-1)}><svg width="15" data-e2e="" height="15" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(90deg)' }}><path fill-rule="evenodd" clip-rule="evenodd" d="M21.8788 33.1213L7.58586 18.8284C7.19534 18.4379 7.19534 17.8047 7.58586 17.4142L10.4143 14.5858C10.8048 14.1953 11.438 14.1953 11.8285 14.5858L24.0001 26.7574L36.1716 14.5858C36.5622 14.1953 37.1953 14.1953 37.5859 14.5858L40.4143 17.4142C40.8048 17.8047 40.8048 18.4379 40.4143 18.8284L26.1214 33.1213C24.9498 34.2929 23.0503 34.2929 21.8788 33.1213Z"></path></svg></button>

                            <span>
                              Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}
                            </span>

                            <button onClick={() => changeMonth(1)}><svg width="15" data-e2e="" height="15" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}><path fill-rule="evenodd" clip-rule="evenodd" d="M21.8788 33.1213L7.58586 18.8284C7.19534 18.4379 7.19534 17.8047 7.58586 17.4142L10.4143 14.5858C10.8048 14.1953 11.438 14.1953 11.8285 14.5858L24.0001 26.7574L36.1716 14.5858C36.5622 14.1953 37.1953 14.1953 37.5859 14.5858L40.4143 17.4142C40.8048 17.8047 40.8048 18.4379 40.4143 18.8284L26.1214 33.1213C24.9498 34.2929 23.0503 34.2929 21.8788 33.1213Z"></path></svg></button>
                          </div>

                          {/* WEEK */}
                          <div className="calendar-week">
                            <span>T2</span>
                            <span>T3</span>
                            <span>T4</span>
                            <span>T5</span>
                            <span>T6</span>
                            <span>T7</span>
                            <span>CN</span>
                          </div>

                          {/* DAYS */}
                          <div className="calendar-grid">
                            {getDaysInMonth(currentDate).map((day, i) => {
                              const isSelected =
                                day &&
                                selectedDate.getDate() === day &&
                                selectedDate.getMonth() === currentDate.getMonth() &&
                                selectedDate.getFullYear() === currentDate.getFullYear();

                              return (
                                <div
                                  key={i}
                                  className={`calendar-day ${isSelected ? "active" : ""} ${
                                    !day ? "empty" : ""
                                  }`}
                                  onClick={() => {
                                    if (!day) return;

                                    const newDate = new Date(currentDate);
                                    newDate.setDate(day);

                                    setSelectedDate(newDate);

                                    // format về state date của bạn
                                    const yyyy = newDate.getFullYear();
                                    const mm = String(newDate.getMonth() + 1).padStart(2, "0");
                                    const dd = String(day).padStart(2, "0");

                                    setDate(`${yyyy}-${mm}-${dd}`);
                                    setShowDate(false);
                                  }}
                                >
                                  {day}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* PRIVACY */}
              <div className="setting-group">
                <label>Ai có thể xem video này</label>

                <div
                  className="privacy-selected"
                  onClick={() => setShowPrivacy(!showPrivacy)}
                >
                  {privacy}
                  <span className={`arrow ${showPrivacy ? "up" : ""}`}><svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="#222"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg></span>
                </div>

                {showPrivacy && (
                  <div className="privacy-dropdown">
                    <div
                      className="item"
                      onClick={() => {
                        setPrivacy("Mọi người");
                        setShowPrivacy(false);
                      }}
                    >
                      <span style={{ flex: 1 }}>Mọi người</span>
                      {privacy === "Mọi người" && <span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" role="img" focusable="false" data-icon="check-bold" aria-hidden="true" fill="currentColor" will-change="auto" transform="rotate(0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.871 7.104a1.25 1.25 0 0 1 .025 1.767l-8.678 8.927a1.35 1.35 0 0 1-1.936 0L4.104 12.47a1.25 1.25 0 1 1 1.792-1.742l4.354 4.478 7.854-8.078a1.25 1.25 0 0 1 1.767-.025"></path></svg></span>}
                    </div>

                    <div
                      className="item"
                      onClick={() => {
                        setPrivacy("Bạn bè");
                        setShowPrivacy(false);
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        Bạn bè
                        <div className="sub">Những follower bạn follow lại</div>
                      </div>
                      {privacy === "Bạn bè" && <span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" role="img" focusable="false" data-icon="check-bold" aria-hidden="true" fill="currentColor" will-change="auto" transform="rotate(0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.871 7.104a1.25 1.25 0 0 1 .025 1.767l-8.678 8.927a1.35 1.35 0 0 1-1.936 0L4.104 12.47a1.25 1.25 0 1 1 1.792-1.742l4.354 4.478 7.854-8.078a1.25 1.25 0 0 1 1.767-.025"></path></svg></span>}
                    </div>

                    <div
                      className="item"
                      onClick={() => {
                        setPrivacy("Chỉ mình bạn");
                        setShowPrivacy(false);
                      }}
                    >
                      <span style={{ flex: 1 }}>Chỉ mình bạn</span>
                      {privacy === "Chỉ mình bạn" && <span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" role="img" focusable="false" data-icon="check-bold" aria-hidden="true" fill="currentColor" will-change="auto" transform="rotate(0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.871 7.104a1.25 1.25 0 0 1 .025 1.767l-8.678 8.927a1.35 1.35 0 0 1-1.936 0L4.104 12.47a1.25 1.25 0 1 1 1.792-1.742l4.354 4.478 7.854-8.078a1.25 1.25 0 0 1 1.767-.025"></path></svg></span>}
                    </div>
                  </div>
                )}
              </div>                      

              <div className="brand-block">

              {/* HEADER */}
              <div className="brand-row">
                <span className="brand-title">Khai báo nội dung bài đăng</span>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={showBrandDeclare}
                    onChange={(e) => {
                      setShowBrandDeclare(e.target.checked);
                      if (!e.target.checked) {
                        setIsBrand(false);
                        setIsBrandContent(false);
                      }
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <p className="brand-desc">
                Cho người khác biết bài đăng này quảng bá thương hiệu, sản phẩm hay dịch vụ.
              </p>

              {/* OPTIONS */}
              {showBrandDeclare && (
                <div className="brand-options">
                  
                  <label className="brand-item">
                    <input
                      type="checkbox"
                      checked={isBrand}
                      onChange={(e) => setIsBrand(e.target.checked)}
                    />
                    <span>Thương hiệu của bạn</span>
                    <span className="info"><span
                    style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                    onMouseEnter={() => setShowTooltip('thuonghieu')}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" role="img" focusable="false" data-icon="info" aria-hidden="true" fill="var(--ui-text-placeholder)" will-change="auto" transform="rotate(0)"><path opacity="0.989" d="M11.999 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10m0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16m0 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-1 3a1 1 0 0 0-1 1c0 .482.359.842.812.938l-.593 2.874c-.232 1.161.598 2.188 1.78 2.188h1a1 1 0 0 0 0-2h-.78l.75-3.812a.986.986 0 0 0-.97-1.188z"></path></svg>
                    {showTooltip === 'thuonghieu' && (
                      <span style={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '150%', top: '50%', transform: 'translateY(-50%)', zIndex: 20 }}>
                        {/* Mũi tên nhỏ hướng sang phải */}
                        <span style={{
                          position: 'absolute',
                          left: '-7px',
                          top: '50%',
                          transform: 'translateY(-50%) rotate(45deg)',
                          width: '14px',
                          height: '14px',
                          background: 'rgba(95,95,95,0.58)',
                          borderRadius: '3px',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                        }} />
                        <span style={{
                          position: 'relative',
                          background: 'rgba(95,95,95,0.58)',
                          color: '#fff',
                          padding: '12px 14px',
                          borderRadius: '14px',
                          minWidth: '400px',
                          fontSize: '15px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.10)',
                        }}>
                          Bạn đang quảng bá cho bản thân hoặc doanh nghiệp của chính mình
                        </span>
                      </span>
                    )}
                  </span></span>
                  </label>

                  <label className="brand-item">
                    <input
                      type="checkbox"
                      checked={isBrandContent}
                      onChange={(e) => setIsBrandContent(e.target.checked)}
                    />
                    <span>Nội dung định hướng thương hiệu</span>
                    <span className="info"><span
                    style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                    onMouseEnter={() => setShowTooltip('content')}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16" role="img" focusable="false" data-icon="info" aria-hidden="true" fill="var(--ui-text-placeholder)" will-change="auto" transform="rotate(0)"><path opacity="0.989" d="M11.999 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10m0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16m0 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-1 3a1 1 0 0 0-1 1c0 .482.359.842.812.938l-.593 2.874c-.232 1.161.598 2.188 1.78 2.188h1a1 1 0 0 0 0-2h-.78l.75-3.812a.986.986 0 0 0-.97-1.188z"></path></svg>
                    {showTooltip === 'content' && (
                      <span style={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '150%', top: '50%', transform: 'translateY(-50%)', zIndex: 20 }}>
                        {/* Mũi tên nhỏ hướng sang phải */}
                        <span style={{
                          position: 'absolute',
                          left: '-7px',
                          top: '50%',
                          transform: 'translateY(-50%) rotate(45deg)',
                          width: '14px',
                          height: '14px',
                          background: 'rgba(95,95,95,0.58)',
                          borderRadius: '3px',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                        }} />
                        <span style={{
                          position: 'relative',
                          background: 'rgba(95,95,95,0.58)',
                          color: '#fff',
                          padding: '12px 14px',
                          borderRadius: '14px',
                          minWidth: '400px',
                          fontSize: '15px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.10)',
                        }}>
                          Bạn đang hợp tác có trả phí với một thương hiệu. Sau khi đăng video, hãy mở ứng dụng Tiktok dành cho thiết bị di động và liên kết chiến dịch trong mục "Cài đặt quảng cáo" của video.
                        </span>
                      </span>
                    )}
                  </span></span>
                  </label>

                </div>
              )}

              {/* AI CONTENT */}
              <div className="brand-row ai-row">
                <span>Nội dung do AI tạo</span>

                <label className="switch gray">
                  <input
                    type="checkbox"
                    checked={isAiGenerated}
                    onChange={(e) => setIsAiGenerated(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <p className="brand-desc small">
                Add this label for aigc. <span className="link">Tìm hiểu thêm</span>
              </p>

            </div>
            </div>

            {/* Bottom Buttons */}
            <div className="bottom-actions">
              <button className="post" onClick={handlePost} disabled={isPosting}>
                {isPosting ? "Đăng..." : "Đăng"}
              </button>
              <button>Lưu bản nháp</button>
              <button>Hủy</button>
            </div>
          </div>

          {/* Right */}
          {/* Right */}
          <div className="right">
            <div className="tiktok-phone" tabIndex={0}>

              {video ? (
                <video
                  ref={previewVideoRef}
                  src={video}
                  className="preview-video-full"
                  autoPlay
                  loop
                  onClick={togglePlay}
                  onLoadedMetadata={handleLoaded}
                  onTimeUpdate={handleTimeUpdate}
                />
              ) : (
                <div className="empty-video">Preview</div>
              )}

              {/* Control bar */}
              <div className="real-controls">

                <button onClick={togglePlay}>
                  {isPlaying ? "⏸" : "▶"}
                </button>

                <span>{formatTime(currentTime)}</span>

                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  step="0.1"
                  style={{padding:0}}
                  onChange={seekVideo}
                  className="seekbar"
                />

                <span>{formatTime(duration)}</span>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  style={{padding:0}}
                  onChange={changeVolume}
                  className="volbar"
                />

                <button onClick={fullScreenVideo}>⛶</button>

              </div>
            </div>
          </div>
        </div>
      </main>
      {postPopup && (
        <div className="popup-overlay">
          <div className={`popup-box status-popup ${postPopup.type}`}>
            <h2>{postPopup.title}</h2>
            <p>{postPopup.message}</p>

            <div className="popup-actions">
              <button
                className="btn-next"
                onClick={() => setPostPopup(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* POPUP BƯỚC 1 */}
      {showLinkPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thêm liên kết</h2>

            <div className="popup-label">Loại liên kết</div>

            <div className="popup-select">
              <div className="popup-left">
                <div className="shop-icon">
                  <svg font-size="24px" class="jsx-4244063849" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"><g clip-path="url(#Icon_Anchor-Product_svg__a)"><path d="M0 5a5 5 0 0 1 5-5h38a5 5 0 0 1 5 5v38a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5Z" fill="#F9B71B"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M18.5 14a5.5 5.5 0 1 1 10.63 2H18.87a5.49 5.49 0 0 1-.37-2Zm-2.76 2A8.52 8.52 0 0 1 24 5.5 8.5 8.5 0 0 1 32.26 16h3.91a5 5 0 0 1 4.94 5.76l-2.46 16A5 5 0 0 1 33.71 42H14.29a5 5 0 0 1-4.94-4.24l-2.46-16A5 5 0 0 1 11.83 16h3.9Zm1.76 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm13 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" fill="#fff"></path></g><defs><clipPath id="Icon_Anchor-Product_svg__a"><path fill="#fff" d="M0 0h48v48H0z"></path></clipPath></defs></svg>
                </div>
                <span>Sản phẩm</span>
              </div>

              <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="#222" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
            </div>

            <div className="popup-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowLinkPopup(false)}
              >
                Hủy
              </button>

              <button
                className="btn-next"
                onClick={() => {
                  setShowLinkPopup(false);
                  setShowLinkPopupStep2(true);
                }}
              >
                Tiếp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP BƯỚC 2 */}
      {showLinkPopupStep2 && (
      <div className="popup-overlay">
        <div className="popup-box large">
          
          {/* Header */}
          <div className="popup-header">
            <div className="popup-header-left">
              <button
                className="back-btn"
                onClick={() => {
                  setShowLinkPopupStep2(false);
                  setShowLinkPopup(true);
                }}
              >
                <svg
                  fill="currentColor"
                  fontSize="24"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  className="flip-rtl"
                  style={{ cursor: "pointer" }}
                >
                  <path d="m7.63 24 13.66-13.67a1 1 0 0 0 0-1.41l-1.84-1.84a1 1 0 0 0-1.41 0L1.83 23.28a1 1 0 0 0 0 1.42l16.21 16.22a1 1 0 0 0 1.41 0l1.84-1.84a1 1 0 0 0 0-1.42L7.63 24Z"></path>
                </svg>
              </button>
              <h2>Thêm liên kết sản phẩm</h2>
            </div>
          </div>

          {/* Tabs */}
          <div className="popup-tabs">
            <div
              className={`tab ${activeTab === "shop" ? "active" : ""}`}
              onClick={() => setActiveTab("shop")}
            >
              Cửa hàng của tôi
            </div>

            <div
              className={`tab ${activeTab === "showcase" ? "active" : ""}`}
              onClick={() => setActiveTab("showcase")}
            >
              Trưng bày sản phẩm
            </div>
          </div>

          {/* Content */}
          <div className="popup-content">
            {activeTab === "shop" && (
              <div className="empty-state">
                <img
                  src="https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/ies/creator_center/static/svg/product_content_empty.2732a15b.svg"
                  alt="Không có sản phẩm nào"
                />

                <h3>Không có sản phẩm nào trong cửa hàng của bạn</h3>
                <p>
                  Hãy thêm hoặc quản lý sản phẩm trong Trung tâm người bán.
                </p>
              </div>
            )}

            {activeTab === "showcase" && (
              <div className="empty-state">
                <h3>Chưa có sản phẩm trưng bày</h3>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="popup-actions">
            <button
              className="btn-cancel"
              onClick={() => setShowLinkPopupStep2(false)}
            >
              Hủy
            </button>

            <button className="btn-next disabled">Tiếp</button>
          </div>
        </div>
      </div>
    )}   
    </div>
  );
}
