import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeartbeat } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../utils/authSlice";
import { markAllRead } from "../../utils/notificationSlice";

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const unreadCount = useSelector((state) => state.notifications?.unreadCount || 0);

  return (
    <>
      <style>{`
        .mc-header {
          width: 100%;
          position: sticky;
          top: 0;
          z-index: 50;
          background: #4A90E2;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .mc-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }
        .mc-logo {
          display: flex; 
          align-items: center; 
          gap: 12px;
          cursor: pointer; 
          user-select: none;
          text-decoration: none;
        }
        .mc-logo-icon {
          width: 38px; 
          height: 38px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          display: flex; 
          align-items: center; 
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mc-logo:hover .mc-logo-icon {
          background: rgba(255,255,255,0.25);
          transform: scale(1.05) rotate(-3deg);
          border-color: rgba(255,255,255,0.5);
        }
        .mc-logo-text {
          font-size: 23px; font-weight: 800; color: white;
          letter-spacing: -0.2px; white-space: nowrap;
          -webkit-font-smoothing: antialiased;
        }
        .mc-nav {
          display: flex; 
          align-items: center; 
          gap: 32px;
          list-style: none; 
          margin: 0; 
          padding: 0;
        }
        @media (max-width: 1024px) { .mc-nav { display: none; } }
        .mc-link {
          font-size: 15px; 
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          cursor: pointer; 
          white-space: nowrap;
          position: relative; 
          padding: 4px 0;
          transition: all 0.2s ease;
        }
        .mc-link::after {
          content: ''; 
          position: absolute;
          bottom: 0; 
          left: 0; 
          width: 0; 
          height: 2px;
          background: white; 
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .mc-link:hover { 
          color: white;
          transform: translateY(-1px);
        }
        .mc-link:hover::after { width: 100%; }
        .mc-right { display: flex; align-items: center; gap: 12px; }
        .mc-avatar-wrap { position: relative; }
        .mc-avatar-btn {
          display: flex; 
          align-items: center; 
          gap: 10px;
          padding: 6px 14px 6px 6px; 
          border-radius: 100px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mc-avatar-btn:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.4);
          transform: translateY(-1px);
        }
        .mc-img {
          width: 32px; 
          height: 32px; 
          border-radius: 50%;
          object-fit: cover; 
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .mc-badge {
          position: absolute; 
          top: -2px; 
          right: -2px;
          min-width: 18px; 
          height: 18px;
          background: #FF4D4D; 
          color: white;
          font-size: 11px; 
          font-weight: 800;
          border-radius: 50%; 
          border: 2px solid #4a90e2;
          display: flex; 
          align-items: center; 
          justify-content: center;
        }
        .mc-uname {
          font-size: 14px; 
          font-weight: 700; 
          color: white;
          line-height: 1.2;
        }
        .mc-urole {
          font-size: 11px; 
          color: rgba(255,255,255,0.8);
          font-weight: 500; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .mc-chevron { 
          width: 14px; 
          height: 14px; 
          color: rgba(255,255,255,0.6);
        }
        .mc-drop {
          position: absolute; 
          top: calc(100% + 12px); 
          right: 0;
          width: 220px; 
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          padding: 8px; 
          opacity: 0; 
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 60;
        }
        .mc-avatar-wrap:hover .mc-drop {
          opacity: 1; 
          visibility: visible; 
          transform: translateY(0);
        }
        .mc-drop-head {
          padding: 12px 16px; 
          border-bottom: 1px solid #F1F5F9; 
          margin-bottom: 6px;
        }
        .mc-drop-dname { 
          font-size: 14px; 
          font-weight: 700; 
          color: #1E293B; 
        }
        .mc-drop-drole { 
          font-size: 12px; 
          color: #64748B; 
          text-transform: capitalize; 
        }
        .mc-item {
          display: flex; 
          align-items: center; 
          gap: 12px;
          padding: 10px 16px; 
          border-radius: 12px;
          font-size: 14px; 
          font-weight: 600; 
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mc-item svg { 
          width: 16px; 
          height: 16px; 
          color: #94A3B8; 
        }
        .mc-item:hover { 
          background: #F1F5F9; 
          color: #2563EB; 
        }
        .mc-item:hover svg { color: #2563EB; }
        .mc-item.red:hover { 
          background: #FFF1F2; 
          color: #E11D48; 
        }
        .mc-item.red:hover svg { color: #E11D48; }
        .mc-divider { 
          height: 1px; 
          background: #F1F5F9; 
          margin: 6px 0; 
        }
        .mc-cta {
          background: white; 
          color: #2563EB; 
          padding: 12px 24px; 
          border-radius: 12px;
          font-size: 15px; 
          font-weight: 700; 
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border: none;
        }
        .mc-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          background: #F8FAFC;
        }
        .mc-signin {
          font-size: 15px; 
          font-weight: 600;
          color: white; 
          cursor: pointer;
          background: none; 
          border: none;
          padding: 8px 12px;
          transition: opacity 0.2s;
        }
        .mc-signin:hover { opacity: 0.8; }
        .mc-right-wrap {
          display: flex;
          align-items: center;
          gap: 40px;
        }
        .mc-auth-wrap {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .mc-inner { padding: 0 16px; gap: 12px; }
          .mc-right-wrap { gap: 16px; }
          .mc-auth-wrap { gap: 8px; }
          .mc-logo-text { font-size: 20px; }
          .mc-cta { padding: 8px 14px; font-size: 13px; }
          .mc-signin { padding: 8px 8px; font-size: 13px; }
        }
        @media (max-width: 480px) {
          .mc-logo-text { display: none; }
          .mc-inner { padding: 0 12px; }
          .mc-right { gap: 8px; }
          .mc-right-wrap { gap: 12px; }
          .mc-avatar-btn { padding: 4px; gap: 6px; }
          .mc-drop { right: -20px; width: 200px; }
        }
      `}</style>

      <header className="mc-header">
        <div className="mc-inner">

          {/* Logo */}
          <div className="mc-logo" onClick={() => navigate("/")}>
            <div className="mc-logo-icon">
              <FontAwesomeIcon icon={faHeartbeat} style={{ color: "white", fontSize: 18 }} />
            </div>
            <span className="mc-logo-text">MedConnect</span>
          </div>

          {/* Right side */}
          <div className="mc-right-wrap">

            {/* Nav links */}
            <ul className="mc-nav">
              <li className="mc-link" onClick={() => navigate("/")}>Home</li>
              <li className="mc-link" onClick={() => navigate("/about")}>About Us</li>
              {user?.role !== "doctor" && user?.role !== "admin" && (
                <li className="mc-link" onClick={() => navigate("/doctorRegistration")}>Join as Doctor</li>
              )}
              {user?.role === "admin" && (
                <li className="mc-link" onClick={() => navigate("/admin")}>Admin Panel</li>
              )}
            </ul>

            {/* Auth section */}
            <div className="mc-right">
              {user ? (
                <div className="mc-avatar-wrap">
                  <button className="mc-avatar-btn" onClick={() => dispatch(markAllRead())}>
                    <div style={{ position: "relative" }}>
                      <img
                        className="mc-img"
                        alt="profile"
                        src={user?.img_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz91eUPPyxLMbt7e7JzPdGKP_-rCGhKEGHR--SDRpS_3BTQsgXS_9MIHs&s"}
                      />
                      {unreadCount > 0 && <span className="mc-badge">{unreadCount}</span>}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="mc-uname">{user.name || "User"}</div>
                      <div className="mc-urole">{user.role}</div>
                    </div>
                    <svg className="mc-chevron hidden sm:block" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div className="mc-drop">
                    <div className="mc-drop-head">
                      <div className="mc-drop-dname">{user.name || "User"}</div>
                      <div className="mc-drop-drole">{user.role} account</div>
                    </div>
                    <ul style={{ padding: 0, margin: 0 }}>
                      {user.role !== "admin" && (
                        <>
                          <li className="mc-item" onClick={() => navigate("/profile")}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                            Profile Settings
                          </li>
                          <li className="mc-item" onClick={() => navigate("/appointments")}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            My Appointments
                          </li>
                          <div className="mc-divider" />
                        </>
                      )}
                      <li className="mc-item red" onClick={() => { dispatch(logout()); navigate("/"); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="mc-auth-wrap">
                  <button className="mc-signin" onClick={() => navigate("/login")}>Sign in</button>
                  <button className="mc-cta" onClick={() => navigate("/login")}>Get Started</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}