import React, { useState, useEffect } from 'react';

export default function WindowSettingsSection({ windowStatuses = [], onDeleteWindow }) {
  const [selectedWindowId, setSelectedWindowId] = useState('');
  const [cycleDuration, setCycleDuration] = useState('5 Hours');
  const [autoRepeat, setAutoRepeat] = useState(true);
  const [showTitleOverlay, setShowTitleOverlay] = useState(true);
  const [enableTransition, setEnableTransition] = useState(true);
  const [transitionDuration, setTransitionDuration] = useState('1 second');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (windowStatuses && windowStatuses.length > 0) {
      const current = windowStatuses.find((w) => String(w.windowId) === String(selectedWindowId)) || windowStatuses[0];
      if (current) {
        setSelectedWindowId(current.windowId);
      }
    }
  }, [windowStatuses, selectedWindowId]);

  const handleWindowChange = (e) => {
    setSelectedWindowId(e.target.value);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="middle-grid-card settings-card">
      <div className="card-header-bar">
        <div className="card-title-group">
          <span className="card-header-icon">⚙️</span>
          <h3>Window Settings</h3>
        </div>
      </div>

      <form className="settings-form-body" onSubmit={handleSave}>
        {/* Select Display Window */}
        {windowStatuses && windowStatuses.length > 0 && (
          <div className="settings-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label htmlFor="select-display-window" style={{ margin: 0 }}>Display Window</label>
              {selectedWindowId && onDeleteWindow && (
                <button
                  type="button"
                  className="btn-delete-window-card"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => {
                    const selectedWin = windowStatuses.find((w) => String(w.windowId) === String(selectedWindowId));
                    const winName = selectedWin ? selectedWin.windowName : `Window ID ${selectedWindowId}`;
                    if (window.confirm(`Are you sure you want to delete "${winName}"?`)) {
                      onDeleteWindow(Number(selectedWindowId));
                    }
                  }}
                >
                  🗑️ Delete Window
                </button>
              )}
            </div>
            <select
              id="select-display-window"
              className="settings-select"
              value={selectedWindowId}
              onChange={handleWindowChange}
            >
              {windowStatuses.map((w) => (
                <option key={w.windowId} value={w.windowId}>
                  {w.windowName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Default Cycle Duration */}
        <div className="settings-field-group">
          <label htmlFor="cycle-duration">Default Cycle Duration</label>
          <select
            id="cycle-duration"
            className="settings-select"
            value={cycleDuration}
            onChange={(e) => setCycleDuration(e.target.value)}
          >
            <option value="5 Hours">5 Hours</option>
            <option value="1 Hour">1 Hour</option>
            <option value="2 Hours">2 Hours</option>
            <option value="3 Hours">3 Hours</option>
            <option value="4 Hours">4 Hours</option>
          </select>
        </div>

        {/* Auto Repeat Playlist */}
        <div className="settings-toggle-row">
          <span className="toggle-label">Auto Repeat Playlist</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={autoRepeat}
              onChange={(e) => setAutoRepeat(e.target.checked)}
              aria-label="Auto Repeat Playlist"
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Show Media Title (Overlay) */}
        <div className="settings-toggle-row">
          <span className="toggle-label">Show Media Title (Overlay)</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showTitleOverlay}
              onChange={(e) => setShowTitleOverlay(e.target.checked)}
              aria-label="Show Media Title Overlay"
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Enable Transition Effect */}
        <div className="settings-toggle-row">
          <span className="toggle-label">Enable Transition Effect</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={enableTransition}
              onChange={(e) => setEnableTransition(e.target.checked)}
              aria-label="Enable Transition Effect"
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Transition Duration */}
        <div className="settings-field-group">
          <label htmlFor="transition-duration">Transition Duration</label>
          <select
            id="transition-duration"
            className="settings-select"
            value={transitionDuration}
            onChange={(e) => setTransitionDuration(e.target.value)}
          >
            <option value="0.5 second">0.5 second</option>
            <option value="1 second">1 second</option>
            <option value="2 seconds">2 seconds</option>
          </select>
        </div>

        {/* Save Changes Footer */}
        <div className="settings-submit-box">
          {savedSuccess && <span className="save-success-msg">✓ Settings saved successfully!</span>}
          <button type="submit" className="btn-save-settings-gradient">
            💾 Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
