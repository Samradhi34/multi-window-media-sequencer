import React, { useState, useEffect, useRef } from 'react';

const MediaPlayer = React.memo(function MediaPlayer({ activeMediaItem, mediaCatalog = [], elapsedSeconds, remainingSeconds, isSyncActive }) {
  const [hasMediaError, setHasMediaError] = useState(false);
  const videoRef = useRef(null);

  const catalogMatch = mediaCatalog.find((m) => String(m.id) === String(activeMediaItem?.id));
  const url = (activeMediaItem?.url && activeMediaItem.url.trim() !== '') ? activeMediaItem.url : catalogMatch?.url;
  const mediaType = activeMediaItem?.mediaType || catalogMatch?.mediaType || 'BLANK';
  const title = activeMediaItem?.title || catalogMatch?.title || 'Media Display Screen';
  const durationSeconds = activeMediaItem?.durationSeconds || catalogMatch?.durationSeconds || 30;

  useEffect(() => {
    setHasMediaError(false);
  }, [activeMediaItem?.id, url, isSyncActive]);

  useEffect(() => {
    if (mediaType === 'VIDEO' && videoRef.current && url && !hasMediaError) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        promise.catch(() => {});
      }
    }
  }, [mediaType, url, isSyncActive, hasMediaError]);

  if (!activeMediaItem) {
    return (
      <div className="media-player blank-screen">
        <div className="blank-content">
          <span className="blank-icon">🖥️</span>
          <p>No Active Playback</p>
        </div>
      </div>
    );
  }

  const progressPercent = durationSeconds > 0 ? Math.min(100, (elapsedSeconds / durationSeconds) * 100) : 0;

  const handleMediaError = () => {
    setHasMediaError(true);
  };

  return (
    <div className={`media-player ${isSyncActive ? 'sync-override-player' : ''}`}>
      {/* Overlay Status Badge */}
      <div className="player-badge-container">
        {isSyncActive ? (
          <span className="badge badge-sync">⚡ GLOBAL SYNC OVERRIDE</span>
        ) : (
          <span className={`badge badge-${mediaType.toLowerCase()}`}>{mediaType}</span>
        )}
        <span className="badge badge-timer">⏱️ {remainingSeconds}s left</span>
      </div>

      {/* Screen Content Render */}
      <div className="viewport">
        {mediaType === 'VIDEO' && url && !hasMediaError ? (
          <video
            ref={videoRef}
            key={`player-vid-${activeMediaItem?.id || 'none'}-${isSyncActive ? 'sync' : 'normal'}`}
            src={url}
            autoPlay
            muted
            loop
            playsInline
            onError={handleMediaError}
            className="video-element"
          />
        ) : mediaType === 'IMAGE' && url && !hasMediaError ? (
          <img
            key={url}
            src={url}
            alt={title}
            onError={handleMediaError}
            className="image-element"
          />
        ) : (
          <div className="blank-screen">
            <div className="blank-content">
              <span className="blank-icon">
                {mediaType === 'BLANK' ? '⬛' : '🎬'}
              </span>
              <h3>{title || 'Media Display Screen'}</h3>
              <p className="blank-note">
                {mediaType === 'BLANK'
                  ? 'Configured Playlist Blank Item'
                  : `${mediaType} Asset Preview`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Media Metadata & Progress Bar */}
      <div className="player-footer">
        <div className="media-title-row">
          <span className="media-title">{title}</span>
          <span className="media-time-info">
            {elapsedSeconds}s / {durationSeconds}s
          </span>
        </div>
        <div className="progress-bar-bg">
          <div
            className={`progress-bar-fill ${isSyncActive ? 'sync-fill' : ''}`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
});

export default MediaPlayer;
