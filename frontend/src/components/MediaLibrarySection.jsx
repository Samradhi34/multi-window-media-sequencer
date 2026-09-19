import React, { useState } from 'react';

export default function MediaLibrarySection({ mediaCatalog, onOpenAddMediaModal, onDeleteMedia }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCatalog = mediaCatalog.filter((item) => {
    const matchesType = filterType === 'ALL' || item.mediaType === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      let videoId = '';
      if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
      else if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1`;
    }
    return null;
  };

  return (
    <div className="middle-grid-card media-library-card">
      <div className="card-header-bar">
        <div className="card-title-group">
          <span className="card-header-icon">🖼️</span>
          <h3>Media Library</h3>
        </div>
        <button className="btn-add-media-primary" onClick={onOpenAddMediaModal}>
          + Add Media
        </button>
      </div>

      <div className="library-filter-row">
        <div className="library-tabs">
          {['ALL', 'IMAGE', 'VIDEO', 'BLANK'].map((type) => (
            <button
              key={type}
              className={`library-tab-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'ALL' ? 'All' : type === 'IMAGE' ? 'Images' : type === 'VIDEO' ? 'Videos' : 'Blank'}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper">
          <span className="search-icon-symbol">🔍</span>
          <input
            type="text"
            placeholder="Search media by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="library-thumbnails-grid">
        {filteredCatalog.map((item) => {
          const embed = getEmbedUrl(item.url);

          return (
            <div key={item.id} className="thumb-item-card">
              <div className="thumb-image-container">
                {item.mediaType === 'IMAGE' && item.url ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                ) : item.mediaType === 'VIDEO' ? (
                  <div className="video-thumb-overlay">
                    {embed ? (
                      <iframe src={embed} title={item.title} className="thumb-video-element" tabIndex="-1" />
                    ) : item.url ? (
                      <video
                        src={item.url}
                        preload="metadata"
                        muted
                        playsInline
                        className="thumb-video-element"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://vjs.zencdn.net/v/oceans.mp4';
                        }}
                      />
                    ) : null}
                    <div className="video-thumb-play-overlay">
                      <div className="play-icon-circle">
                        <svg viewBox="0 0 24 24" className="play-svg-icon" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <span className="video-cam-badge">📹</span>
                  </div>
                ) : (
                  <div className="blank-thumb-box">
                    <span>⬛</span>
                  </div>
                )}
              {onDeleteMedia && (
                <button
                  className="catalog-thumb-delete-btn"
                  title={`Delete "${item.title}" from catalog`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${item.title}" from media catalog?`)) {
                      onDeleteMedia(item.id);
                    }
                  }}
                >
                  🗑
                </button>
              )}
            </div>
            <div className="thumb-item-footer">
              <span className="thumb-title-text">{item.title}</span>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
