import React, { useState, useEffect } from 'react';

export default function WindowSettingsSection({ windowStatuses = [] }) {
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
            <div className="label-with-helper">
              <label htmlFor="select-display-window">Display Window</label>
              <p className="setting-helper-text">Select which physical display screen to configure.</p>
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
          <div className="label-with-helper">
            <label htmlFor="cycle-duration">Default Cycle Duration</label>
            <p className="setting-helper-text">Controls how long the playlist schedule runs before restarting.</p>
          </div>
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
          <div className="label-with-helper">
            <span className="toggle-label">Auto Repeat Playlist</span>
            <p className="setting-helper-text">Restart playlist from the beginning after reaching the end.</p>
          </div>
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
          <div className="label-with-helper">
            <span className="toggle-label">Show Media Title (Overlay)</span>
            <p className="setting-helper-text">Display media title text over the playing content.</p>
          </div>
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
          <div className="label-with-helper">
            <span className="toggle-label">Enable Transition Effect</span>
            <p className="setting-helper-text">Apply a visual fade animation between media items.</p>
          </div>
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
          <div className="label-with-helper">
            <label htmlFor="transition-duration">Transition Duration</label>
            <p className="setting-helper-text">Controls how long the visual transition animation lasts.</p>
          </div>
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
