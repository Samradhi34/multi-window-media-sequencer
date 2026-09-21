import React, { useState, useEffect } from 'react';

export default function TopHeader({ isConnected, isWebSocketActive = false, serverTimeMs, onToggleMobileSidebar = () => {} }) {
  const [formattedTime, setFormattedTime] = useState('');
  const [timeOffset, setTimeOffset] = useState(0);

  useEffect(() => {
    if (serverTimeMs) {
      const diff = serverTimeMs - Date.now();
      setTimeOffset(diff);
    }
  }, [serverTimeMs]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date(Date.now() + timeOffset);
      const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = now.getDate();
      const monthName = now.toLocaleDateString('en-US', { month: 'short' });
      const year = now.getFullYear();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      setFormattedTime(`${dayName}, ${dayNum} ${monthName} ${year} ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeOffset]);

  return (
    <header className="top-header-bar">
      <div className="header-left-group">
        <button
          className="mobile-hamburger-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div className="header-subtitle-tags">
          <span>Multiple windows</span>
          <span className="dot-separator">•</span>
          <span>Synchronized playback</span>
          <span className="dot-separator">•</span>
          <span>Dynamic playlists</span>
        </div>
      </div>

      <div className="header-right-widgets">
        <div className={`header-status-badge ${isConnected ? 'online' : 'offline'}`}>
          <span className="live-status-dot"></span>
          <span>{isWebSocketActive ? '⚡ WebSocket Live' : isConnected ? 'System Online' : 'System Offline'}</span>
        </div>

        <div className="header-clock-pill">
          {formattedTime}
        </div>
      </div>
    </header>
  );
}
