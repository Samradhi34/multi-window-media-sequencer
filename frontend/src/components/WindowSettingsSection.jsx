import React, { useState, useEffect } from 'react';

export default function WindowSettingsSection({
  windowStatuses = [],
  windowSettingsMap = {},
  onUpdateWindowSettings,
}) {
  const DEFAULT_SETTINGS = {
    cycleDuration: '5 Hours',
    autoRepeat: true,
    showTitleOverlay: true,
    enableTransition: true,
    transitionDuration: '1 second',
  };

  const [selectedWindowId, setSelectedWindowId] = useState('');
  const [formSettings, setFormSettings] = useState(DEFAULT_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Initialize or update selected window when window list changes
  useEffect(() => {
    if (windowStatuses && windowStatuses.length > 0) {
      const exists = windowStatuses.some((w) => String(w.windowId) === String(selectedWindowId));
      if (!exists) {
        setSelectedWindowId(String(windowStatuses[0].windowId));
      }
    }
  }, [windowStatuses, selectedWindowId]);

  // Sync form state when selected window or windowSettingsMap changes
  useEffect(() => {
    if (selectedWindowId) {
      const current = windowSettingsMap[selectedWindowId] || DEFAULT_SETTINGS;
      setFormSettings(current);
    }
  }, [selectedWindowId, windowSettingsMap]);

  const handleWindowChange = (e) => {
    const newId = e.target.value;
    setSelectedWindowId(newId);
    const current = windowSettingsMap[newId] || DEFAULT_SETTINGS;
    setFormSettings(current);
  };

  const updateSettingField = (field, value) => {
    const updated = { ...formSettings, [field]: value };
    setFormSettings(updated);
    if (onUpdateWindowSettings && selectedWindowId) {
      onUpdateWindowSettings(selectedWindowId, updated);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateWindowSettings && selectedWindowId) {
      onUpdateWindowSettings(selectedWindowId, formSettings);
    }
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
            <label htmlFor="select-display-window">Display Window</label>
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
            value={formSettings.cycleDuration}
            onChange={(e) => updateSettingField('cycleDuration', e.target.value)}
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
              checked={formSettings.autoRepeat}
              onChange={(e) => updateSettingField('autoRepeat', e.target.checked)}
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
              checked={formSettings.showTitleOverlay}
              onChange={(e) => updateSettingField('showTitleOverlay', e.target.checked)}
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
              checked={formSettings.enableTransition}
              onChange={(e) => updateSettingField('enableTransition', e.target.checked)}
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
            value={formSettings.transitionDuration}
            onChange={(e) => updateSettingField('transitionDuration', e.target.value)}
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
