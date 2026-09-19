import React from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isConnected,
  totalMediaCount = 8,
  windowCount = 3,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🎛️' },
    { id: 'windows', label: 'Windows', icon: '🖥️' },
    { id: 'library', label: 'Media Library', icon: '🖼️' },
    { id: 'playlists', label: 'Playlists', icon: '📋' },
    { id: 'sync', label: 'Sync Playback', icon: '🔗' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div className="mobile-sidebar-backdrop" onClick={onCloseMobile}></div>
      )}

      <aside className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top-section">
          {/* Brand Header */}
          <div className="sidebar-brand">
            <div className="brand-logo-box">
              <svg className="brand-play-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" fill="currentColor"/>
              </svg>
            </div>
            <div className="brand-text-block">
              <h2>Media Sequencer</h2>
              <p className="brand-subtitle">Multi-Window Media Playback</p>
            </div>
            <button className="mobile-sidebar-close-btn" onClick={onCloseMobile} aria-label="Close menu">
              ✕
            </button>
          </div>

          {/* Sidebar Navigation Links */}
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="nav-icon-span">{item.icon}</span>
                <span className="nav-label-span">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

      {/* Sidebar Lower Section */}
      <div className="sidebar-bottom-section">
        {/* Mountain Image Graphic Snippet */}
        <div className="sidebar-graphic-card">
          <div className="mountain-graphic-overlay"></div>
        </div>

        {/* System Status Panel */}
        <div className="sidebar-status-panel">
          <div className="status-header-line">
            <span className={`status-dot-pulse ${isConnected ? 'online' : 'offline'}`}></span>
            <span className="status-header-title">System Status</span>
          </div>
          <p className="status-state-text">
            {isConnected ? 'All systems running' : 'Connecting to server...'}
          </p>

          <div className="status-metrics-grid">
            <div className="metric-box">
              <span className="metric-val">{windowCount}/{windowCount}</span>
              <span className="metric-lbl">Windows Online</span>
            </div>
            <div className="metric-box">
              <span className="metric-val">{totalMediaCount}</span>
              <span className="metric-lbl">Total Media</span>
            </div>
            <div className="metric-box">
              <span className="metric-val">5h</span>
              <span className="metric-lbl">Cycle Duration</span>
            </div>
          </div>

          <div className="sidebar-brand-tagline">
            <em>Better Media Better Experiences</em>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
