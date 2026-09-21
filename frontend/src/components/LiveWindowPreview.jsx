import React, { useState, useEffect, useRef } from 'react';
import WindowPreviewCard from './WindowPreviewCard';

export default function LiveWindowPreview({
  windowStatuses = [],
  mediaCatalog = [],
  windowSettingsMap = {},
  onOpenAddWindow,
  onDeleteWindow,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sectionRef = useRef(null);

  const DEFAULT_SETTINGS = {
    cycleDuration: '5 Hours',
    autoRepeat: true,
    showTitleOverlay: true,
    enableTransition: true,
    transitionDuration: '1 second',
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (sectionRef.current?.requestFullscreen) {
        sectionRef.current.requestFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const count = windowStatuses ? windowStatuses.length : 3;

  return (
    <section className={`live-preview-section ${isFullscreen ? 'fullscreen-active' : ''}`} ref={sectionRef}>
      <div className="section-title-bar">
        <div className="title-with-icon">
          <span className="section-title-icon">🖥️</span>
          <h2>Live Preview - Display Windows</h2>
        </div>
        <div className="header-status-group">
          <span className="badge-playing-status">● All Windows Playing</span>
          {onOpenAddWindow && (
            <button className="btn-add-window-header" onClick={onOpenAddWindow}>
              + Add Window
            </button>
          )}
          <button className="btn-fullscreen-global" onClick={toggleFullscreen}>
            {isFullscreen ? '⛶ Exit Full Screen' : '⛶ Full Screen'}
          </button>
        </div>
      </div>

      <div className="live-preview-3col-grid" data-count={count}>
        {windowStatuses.map((ws) => (
          <WindowPreviewCard
            key={ws.windowId}
            windowStatus={ws}
            mediaCatalog={mediaCatalog}
            settings={windowSettingsMap[ws.windowId] || DEFAULT_SETTINGS}
            onDeleteWindow={onDeleteWindow}
          />
        ))}
      </div>
    </section>
  );
}
