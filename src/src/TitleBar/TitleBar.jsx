import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./titlebar.css";
import { getCurrentWindow } from "@tauri-apps/api/window";

// getting the current window instance
const appWindow = getCurrentWindow();

export function TitleBar() {
  const [maximized, setMaximized] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // checking if window is maximized or not
    appWindow.isMaximized().then((isMaximized) => {
      setMaximized(isMaximized);
    });
  }, []);

  // close Window button
  const closeWindow = () => {
    appWindow.close();
  };

  // minimize Window button
  const minimizeWindow = () => {
    appWindow.minimize();
  };

  // maximize Window button
  const maximizeWindow = async () => {
    await appWindow.toggleMaximize();
    const isMax = await appWindow.isMaximized();
    setMaximized(isMax);
  };

  const isLoginPage = location.pathname === '/' || location.pathname === '/register' || location.pathname === '/vehicle-ops-login';

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1rem', zIndex: 10 }}>
        {!isLoginPage && (
          <button 
            onClick={() => navigate('/')} 
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Logout
          </button>
        )}
      </div>

      <div style={{ display: 'flex', marginLeft: 'auto' }}>
        {/* minimize buton */}
        <button className="btns minimize-btn" onClick={minimizeWindow}>
          <svg width="10" height="1" viewBox="0 0 10 1">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        {/* maximize button */}
        <button
          className="btns maximize-btn"
          onClick={maximizeWindow}
        >
          {maximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path
                d="M3 1h6v6H8v1h2V0H2v2h1V1zm-2 2h6v6H1V3zm1 1v4h4V4H2z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M0 0v10h10V0H0zm9 9H1V1h8v8z" fill="currentColor" />
            </svg>
          )}
        </button>

        <button className="btns close-btn" onClick={closeWindow} title="Close">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M10 .707L9.293 0 5 4.293.707 0 0 .707 4.293 5 0 9.293l.707.707L5 5.707 9.293 10l.707-.707L5.707 5z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
