import React, { useState, useEffect } from 'react';

export default function SyncPlaybackPanel({ mediaCatalog = [], syncStatus, onTriggerSync, onCancelSync }) {
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  // Automatically reset selected media if item is removed/deleted from catalog
  useEffect(() => {
    if (selectedMediaId && !mediaCatalog.some((item) => String(item.id) === String(selectedMediaId))) {
      setSelectedMediaId('');
    }
  }, [mediaCatalog, selectedMediaId]);

  const handleStartSync = async () => {
    if (!selectedMediaId) {
      if (mediaCatalog.length > 0) {
        setSelectedMediaId(mediaCatalog[0].id);
        await onTriggerSync(mediaCatalog[0].id, durationSeconds);
      } else {
        alert('Please select a media item to sync.');
      }
      return;
    }
    try {
      setSubmitting(true);
      await onTriggerSync(selectedMediaId, durationSeconds);
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStopSync = async () => {
    try {
      setSubmitting(true);
      await onCancelSync();
    } catch (err) {
      alert(`Cancel sync failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel-card sync-playback-panel">
      <div className="panel-header">
        <span className="panel-header-icon">⚡</span>
        <h3>Sync Playback</h3>
      </div>

      <div className="panel-body">
        {syncStatus.isActive ? (
          <div className="active-sync-state-box">
            <div className="pulse-indicator-row">
              <span className="pulse-dot-amber"></span>
              <strong>Synchronized Broadcast Active</strong>
            </div>
            <p className="active-sync-detail">
              {syncStatus.activeMediaItem?.title || 'Sync Media'} ({syncStatus.remainingSeconds}s remaining)
            </p>
            <button className="btn-stop-sync-gradient" onClick={handleStopSync} disabled={submitting}>
              ⏹ End Sync Broadcast
            </button>
          </div>
        ) : (
          <div className="sync-panel-form">
            <div className="form-field-group">
              <label>Select Media Item</label>
              <select
                className="panel-select"
                value={selectedMediaId}
                onChange={(e) => setSelectedMediaId(e.target.value)}
              >
                <option value="">Choose media asset...</option>
                {mediaCatalog.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.mediaType})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label>Duration</label>
              <select
                className="panel-select"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={45}>45 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>

            <button
              className="btn-start-sync-gradient"
              onClick={handleStartSync}
              disabled={submitting}
            >
              {submitting ? 'Syncing...' : '▶ Start Sync'}
            </button>

            <div className="sync-info-notice-box">
              <span className="info-icon">ℹ</span>
              <p>The selected media will play simultaneously on all 3 windows for the specified duration.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
