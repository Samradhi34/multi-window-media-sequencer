import React, { useState, useEffect, useRef } from 'react';

export default function TopHeader({ isConnected, isWebSocketActive = false, serverTimeMs, onToggleMobileSidebar = () => {} }) {
  const [formattedTime, setFormattedTime] = useState('');
  const [timeOffset, setTimeOffset] = useState(0);

  // Operator name — read from localStorage, fallback to "Operator"
  const STORAGE_KEY = 'media_sequencer_operator_name';
  const getSavedName = () => {
    try { return localStorage.getItem(STORAGE_KEY) || 'Operator'; } catch { return 'Operator'; }
  };
  const [operatorName, setOperatorName] = useState(getSavedName);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  // Auto-generate initials from name (e.g. "Bharti Pandit" → "BP")
  const getInitials = (name) => {
    if (!name || name === 'Operator') return 'OP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Extract first name for display
  const getFirstName = (name) => {
    if (!name) return 'Operator';
    return name.trim().split(/\s+/)[0];
  };

  const handleAvatarClick = () => {
    setEditValue(operatorName === 'Operator' ? '' : operatorName);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSaveName = () => {
    const trimmed = editValue.trim();
    const finalName = trimmed || 'Operator';
    setOperatorName(finalName);
    try { localStorage.setItem(STORAGE_KEY, finalName); } catch {}
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') setIsEditing(false);
  };

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

        {/* Operator Badge — click to edit name */}
        <div
          className="header-user-avatar-badge"
          title="Click to set your name"
          onClick={handleAvatarClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="avatar-circle">{getInitials(operatorName)}</div>
          <div className="user-info-text">
            {isEditing ? (
              <input
                ref={inputRef}
                className="operator-name-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                placeholder="Enter your name"
                maxLength={30}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="user-name-text">{getFirstName(operatorName)}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
