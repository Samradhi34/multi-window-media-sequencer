import React from 'react';
import MediaPlayer from './MediaPlayer';

export default function WindowCard({ windowStatus, mediaCatalog = [], onOpenAddMedia, onRemoveMedia }) {
  const {
    windowId,
    windowName,
    windowDescription,
    activeMediaItem,
    elapsedSecondsInMedia,
    remainingSecondsInMedia,
    playlist = [],
    totalPlaylistDurationSeconds,
    isSyncActive
  } = windowStatus;

  return (
    <div className={`window-card ${isSyncActive ? 'window-sync-mode' : ''}`}>
      <div className="window-card-header">
        <div>
          <h3>{windowName}</h3>
          <p className="window-desc">{windowDescription}</p>
        </div>
        <div className="duration-tag">
          ⏱️ Playlist: {totalPlaylistDurationSeconds}s total
        </div>
      </div>

      <div className="window-player-wrapper">
        <MediaPlayer
          activeMediaItem={activeMediaItem}
          mediaCatalog={mediaCatalog}
          elapsedSeconds={elapsedSecondsInMedia}
          remainingSeconds={remainingSecondsInMedia}
          isSyncActive={isSyncActive}
        />
      </div>

      <div className="playlist-queue-container">
        <div className="playlist-queue-header">
          <h4>Playlist Sequence ({playlist.length} items)</h4>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => onOpenAddMedia(windowId, windowName)}
          >
            ➕ Add Media
          </button>
        </div>

        {playlist.length === 0 ? (
          <p className="empty-playlist-msg">No media in playlist. Displaying blank screen fallback.</p>
        ) : (
          <div className="queue-list">
            {playlist.map((item, index) => {
              const media = item.mediaItem;
              const isActive = activeMediaItem && activeMediaItem.id === media.id && !isSyncActive;

              return (
                <div
                  key={item.id || index}
                  className={`queue-item ${isActive ? 'active-queue-item' : ''}`}
                >
                  <span className="queue-order">#{index + 1}</span>
                  <span className="queue-type-badge">{media.mediaType}</span>
                  <span className="queue-title">{media.title}</span>
                  <span className="queue-duration">{media.durationSeconds}s</span>
                  
                  <button
                    className="btn-delete-icon"
                    title="Remove from playlist"
                    onClick={() => onRemoveMedia(windowId, media.id)}
                  >
                    ❌
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
