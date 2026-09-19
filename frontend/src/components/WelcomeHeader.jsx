import React from 'react';

export default function WelcomeHeader({
  mediaCount = 8,
  isSyncActive = false,
  windowCount = 3,
  onCancelSync,
  onNavigateSync
}) {
  const handleSyncPillClick = () => {
    if (isSyncActive) {
      if (onCancelSync) onCancelSync();
    } else {
      if (onNavigateSync) onNavigateSync();
    }
  };

  return (
    <div className="welcome-hero-row">
      <div className="welcome-banner-card full-width-welcome">
        <div className="welcome-left-group">
          <div className="welcome-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7L8 5z" fill="#fff" />
            </svg>
          </div>
          <div className="welcome-text-block">
            <h3>Welcome to Media Sequencer</h3>
            <p>Manage your media windows, playlists and control synchronized playback across all displays.</p>
          </div>
        </div>

        <div className="welcome-right-metrics">
          <div className="welcome-stat-pill">
            <span className="stat-pill-label">Displays:</span>
            <span className="stat-pill-value">{windowCount} Windows</span>
          </div>
          <div className="welcome-stat-pill">
            <span className="stat-pill-label">Cycle:</span>
            <span className="stat-pill-value">5 Hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
