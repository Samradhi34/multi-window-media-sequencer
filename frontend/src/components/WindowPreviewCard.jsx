import React, { useState, useRef, useEffect } from 'react';

const WindowPreviewCard = React.memo(function WindowPreviewCard({ windowStatus = {}, mediaCatalog = [], onDeleteWindow }) {
  const {
    windowName,
    activeMediaItem,
    elapsedSecondsInMedia = 0,
    remainingSecondsInMedia = 0,
    isSyncActive
  } = windowStatus || {};

  const catalogMatch = mediaCatalog.find((m) => String(m.id) === String(activeMediaItem?.id));
  const mediaType = activeMediaItem?.mediaType || catalogMatch?.mediaType || 'BLANK';
  const title = activeMediaItem?.title || catalogMatch?.title || 'Blank Screen';
  const url = activeMediaItem?.url || catalogMatch?.url;

  const [videoSrc, setVideoSrc] = useState(url);
  const [hasError, setHasError] = useState(false);
  const [isCardFullscreen, setIsCardFullscreen] = useState(false);
  const cardRef = useRef(null);

  const durationSeconds = isSyncActive
    ? (elapsedSecondsInMedia + remainingSecondsInMedia || activeMediaItem?.durationSeconds || 30)
    : (activeMediaItem?.durationSeconds || 30);

  const progressPercent = durationSeconds > 0 ? Math.min(100, (elapsedSecondsInMedia / durationSeconds) * 100) : 0;

  const videoRef = useRef(null);

  // Reset video source and error state when active media item or sync state updates
  useEffect(() => {
    setVideoSrc(url);
    setHasError(false);
  }, [activeMediaItem?.id, url, isSyncActive]);

  // Programmatically manage muted HTML5 video playback to prevent autoplay blocks across multiple windows
  useEffect(() => {
    if (mediaType === 'VIDEO' && videoRef.current && videoSrc && !hasError) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Autoplay policy fallback
        });
      }
    }
  }, [mediaType, videoSrc, isSyncActive, hasError]);

  useEffect(() => {
    const handleFSChange = () => {
      setIsCardFullscreen(document.fullscreenElement === cardRef.current);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const toggleCardFullscreen = () => {
    if (document.fullscreenElement === cardRef.current) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else {
      if (cardRef.current?.requestFullscreen) {
        cardRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getMediaSublabel = () => {
    if (mediaType === 'IMAGE') return 'Explore the world';
    if (mediaType === 'VIDEO') return 'High Definition Video';
    return 'Black Screen Placeholder';
  };

  const getEmbedUrl = (targetUrl) => {
    if (!targetUrl) return null;
    if (targetUrl.includes('youtube.com/watch') || targetUrl.includes('youtu.be/')) {
      let videoId = '';
      if (targetUrl.includes('youtu.be/')) videoId = targetUrl.split('youtu.be/')[1]?.split('?')[0];
      else if (targetUrl.includes('v=')) videoId = targetUrl.split('v=')[1]?.split('&')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
    }
    if (targetUrl.includes('vimeo.com/')) {
      const videoId = targetUrl.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className={`preview-window-card ${isSyncActive ? 'sync-active-window' : ''}`} ref={cardRef}>
      {/* Top Card Header */}
      <div className="preview-card-header-bar">
        <div className="window-playing-info">
          <span className="live-pulse-dot"></span>
          <span className="window-name-title">{windowName}</span>
          <span className="playing-media-tag">
            ● Playing: {activeMediaItem?.title ? activeMediaItem.title.substring(0, 14) : 'Blank'} ({mediaType === 'VIDEO' ? 'Video' : mediaType === 'IMAGE' ? 'Image' : 'Blank'})
          </span>
        </div>
        <div className="card-header-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onDeleteWindow && (
            <button
              className="btn-delete-window-card"
              title={`Delete ${windowName}`}
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete "${windowName}"?`)) {
                  onDeleteWindow(windowStatus.windowId);
                }
              }}
            >
              🗑️ Delete
            </button>
          )}
          <button
            className="btn-fullscreen-toggle"
            title={isCardFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            onClick={toggleCardFullscreen}
          >
            ⛶
          </button>
        </div>
      </div>

      {/* Main Viewport Card */}
      <div className="preview-viewport-box">
        {mediaType === 'VIDEO' && url && !hasError ? (
          <div className="video-viewport-wrapper">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={title}
                className="viewport-media-element"
                allow="autoplay; encrypted-media"
                style={{ border: 'none' }}
              />
            ) : (
              <video
                ref={videoRef}
                key={`win-video-${windowStatus?.windowId || 0}-${activeMediaItem?.id || 'none'}-${isSyncActive ? 'sync' : 'normal'}`}
                src={videoSrc || url}
                autoPlay
                muted
                loop
                playsInline
                onError={() => {
                  if (videoSrc !== 'https://vjs.zencdn.net/v/oceans.mp4') {
                    setVideoSrc('https://vjs.zencdn.net/v/oceans.mp4');
                  } else {
                    setHasError(true);
                  }
                }}
                className="viewport-media-element"
              />
            )}
            <div className="video-play-overlay-btn">
              <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: '#ffffff', marginLeft: '2px' }}>
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        ) : mediaType === 'IMAGE' && url && !hasError ? (
          <img
            key={`win-img-${windowStatus?.windowId || 0}-${activeMediaItem?.id || 'none'}-${isSyncActive ? 'sync' : 'normal'}`}
            src={url}
            alt={title}
            onError={() => {
              setHasError(true);
            }}
            className="viewport-media-element"
          />
        ) : (
          <div className="blank-viewport-container">
            <div className="blank-card-text">
              <span className="blank-icon-emoji">{mediaType === 'BLANK' ? '⬛' : '📷'}</span>
              <h4>{title}</h4>
              <p>{mediaType === 'BLANK' ? 'Configured Blank Screen' : 'Media Asset'}</p>
            </div>
          </div>
        )}

        {/* Viewport Overlay Info */}
        <div className="viewport-overlay-footer">
          <div className="viewport-caption">
            <h5 className="caption-title">{title}</h5>
            <p className="caption-subtitle">{getMediaSublabel()}</p>
          </div>

          {isSyncActive ? (
            <div className="viewport-sync-badge">
              ⚡ SYNC BROADCAST ({remainingSecondsInMedia}s)
            </div>
          ) : (
            <div className="viewport-timer-badge">
              {formatTime(elapsedSecondsInMedia)} / {formatTime(durationSeconds)}
            </div>
          )}
        </div>

        {/* Live Progress Tracker */}
        {isSyncActive ? (
          <div className="viewport-sync-pulsing-bar"></div>
        ) : (
          <div className="viewport-progress-track">
            <div
              className="viewport-progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
});

export default WindowPreviewCard;
