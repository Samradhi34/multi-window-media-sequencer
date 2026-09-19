import React, { useState, useEffect } from 'react';

export default function WindowSettingsSection({ windowStatuses = [], onDeleteWindow }) {
  const [selectedWindowId, setSelectedWindowId] = useState('');
  const [windowName, setWindowName] = useState('Window 1');
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
        setWindowName(current.windowName);
      }
    }
  }, [windowStatuses, selectedWindowId]);

  const handleWindowChange = (e) => {
    const id = e.target.value;
    setSelectedWindowId(id);
    const target = windowStatuses.find((w) => String(w.windowId) === String(id));
    if (target) {
      setWindowName(target.windowName);
    }
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
        {windowStatuses && windowStatuses.length > 0 && (
          <div className="settings-field-group">
            <label>Select Display Window</label>
            <select
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

        <div className="settings-field-group">
          <label>Window Name</label>
          <input
            type="text"
            className="settings-input"
            value={windowName}
            onChange={(e) => setWindowName(e.target.value)}
          />
        </div>

        <div className="settings-field-group">
          <label>Default Cycle Duration</label>
          <select
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

        <div className="settings-toggle-row">
          <span className="toggle-label">Auto Repeat Playlist</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={autoRepeat}
              onChange={(e) => setAutoRepeat(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-toggle-row">
          <span className="toggle-label">Show Media Title (Overlay)</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showTitleOverlay}
              onChange={(e) => setShowTitleOverlay(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-toggle-row">
          <span className="toggle-label">Enable Transition Effect</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={enableTransition}
              onChange={(e) => setEnableTransition(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-field-group">
          <label>Transition Duration</label>
          <select
            className="settings-select"
            value={transitionDuration}
            onChange={(e) => setTransitionDuration(e.target.value)}
          >
            <option value="0.5 second">0.5 second</option>
            <option value="1 second">1 second</option>
            <option value="2 seconds">2 seconds</option>
          </select>
        </div>

        <div className="settings-submit-box" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          {savedSuccess && <span className="save-success-msg">✓ Settings saved successfully!</span>}
          <button type="submit" className="btn-save-settings-gradient">
            💾 Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
