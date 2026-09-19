import React, { useState } from 'react';

export default function WindowPlaylistsSection({
  windowStatuses = [],
  mediaCatalog = [],
  onOpenAddMedia,
  onRemoveMedia,
  onMoveMedia,
  onUpdateDuration
}) {
  const [selectedWindowId, setSelectedWindowId] = useState(1);

  const activeWindow = (windowStatuses && windowStatuses.length > 0)
    ? (windowStatuses.find((w) => w.windowId === selectedWindowId) || windowStatuses[0])
    : null;

  const playlist = activeWindow?.playlist || [];

  const handleEditDuration = (mediaId, currentTitle, currentDuration) => {
    const input = window.prompt(`Enter new playback duration in seconds for "${currentTitle}":`, currentDuration);
    if (input !== null) {
      const val = parseInt(input.trim(), 10);
      if (!isNaN(val) && val > 0) {
        if (onUpdateDuration) {
          onUpdateDuration(mediaId, val);
        }
      } else {
        window.alert('Please enter a valid positive number of seconds.');
      }
    }
  };

  return (
    <div className="middle-grid-card playlists-card">
      <div className="card-header-bar">
        <div className="card-title-group">
          <span className="card-header-icon">📋</span>
          <h3>Window Playlists</h3>
        </div>
      </div>

      {/* Window Tabs Bar */}
      <div className="window-selector-tabs">
        {windowStatuses.map((w) => (
          <button
            key={w.windowId}
            className={`window-tab-pill ${w.windowId === (activeWindow?.windowId || 1) ? 'active' : ''}`}
            onClick={() => setSelectedWindowId(w.windowId)}
          >
            {w.windowName}
          </button>
        ))}
      </div>

      {/* Playlist Table */}
      <div className="playlist-table-container">
        <table className="playlist-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-item">Media Item</th>
              <th className="col-duration">Duration</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!activeWindow || playlist.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-table-cell">
                  No items queued in this playlist.
                </td>
              </tr>
            ) : (
              playlist.map((item, index) => {
                const media = item.mediaItem || item;
                const mediaId = media.id || item.id;
                const title = media.title || 'Untitled Media';
                const catalogItem = mediaCatalog.find((m) => String(m.id) === String(mediaId));
                const url = media.url || catalogItem?.url;
                const durationSeconds = media.durationSeconds || catalogItem?.durationSeconds || 0;

                return (
                  <tr key={`${mediaId}-${index}`}>
                    <td className="col-num">{index + 1}</td>
                    <td className="col-item">
                      <div className="table-item-cell">
                        {url && media.mediaType === 'IMAGE' ? (
                          <img src={url} alt={title} className="table-item-thumb" />
                        ) : media.mediaType === 'VIDEO' ? (
                          <div className="table-item-thumb-video-box">
                            {url ? (
                              <video src={url} preload="metadata" muted playsInline className="table-item-thumb" />
                            ) : null}
                            <span className="video-badge-tiny">📹</span>
                          </div>
                        ) : media.mediaType === 'IMAGE' ? (
                          <div className="table-item-thumb-video-box">
                            <span className="video-badge-tiny">📷</span>
                          </div>
                        ) : (
                          <div className="table-item-thumb-blank">⬛</div>
                        )}
                        <span className="table-item-title">{title}</span>
                      </div>
                    </td>
                    <td className="col-duration">{durationSeconds} sec</td>
                    <td className="col-actions">
                      <div className="actions-btn-group">
                        <button
                          className="btn-action-icon edit-btn"
                          title="Edit Duration"
                          onClick={() => handleEditDuration(mediaId, title, durationSeconds)}
                        >
                          ✏
                        </button>
                        <button
                          className="btn-action-icon delete"
                          title="Remove from Playlist"
                          onClick={() => {
                            if (window.confirm(`Remove "${title}" from ${activeWindow.windowName}?`)) {
                              onRemoveMedia(activeWindow.windowId, mediaId);
                            }
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="card-footer-action">
        <button
          className="btn-add-to-playlist-footer"
          onClick={() => onOpenAddMedia(activeWindow?.windowId || 1, activeWindow?.windowName || 'Window 1')}
        >
          + Add to Playlist
        </button>
      </div>
    </div>
  );
}
