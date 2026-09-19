import React, { useState } from 'react';

export default function AddMediaModal({ targetWindow, mediaCatalog, onClose, onAddMedia, onCreateMedia }) {
  const isCatalogOnly = !targetWindow || !targetWindow.id;
  const [activeTab, setActiveTab] = useState(isCatalogOnly ? 'create' : 'catalog'); // 'catalog' or 'create'

  // Catalog selection state
  const [selectedMediaId, setSelectedMediaId] = useState('');

  // Source type for new creation: 'file' (Local System) or 'url' (Web URL)
  const [sourceType, setSourceType] = useState('file');

  // New media creation state
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState('IMAGE');
  const [url, setUrl] = useState('');
  const [localFileName, setLocalFileName] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMessage('');
    setLocalFileName(file.name);

    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }

    if (file.type.startsWith('video/')) {
      setMediaType('VIDEO');
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setUrl(dataUrl);
        setPreviewDataUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaType('IMAGE');
      const compressedUrl = await compressImageFile(file);
      setUrl(compressedUrl);
      setPreviewDataUrl(compressedUrl);
    }
  };

  const handleSelectExisting = async (e) => {
    e.preventDefault();
    if (!selectedMediaId || isCatalogOnly) return;
    try {
      setSubmitting(true);
      setErrorMessage('');
      await onAddMedia(targetWindow.id, selectedMediaId);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add media to playlist');
    } finally {
      setSubmitting(false);
    }
  };

  const isVideoUrlPattern = (urlStr) => {
    if (!urlStr) return false;
    const clean = urlStr.toLowerCase().trim().split('?')[0];
    const videoExts = ['.mp4', '.webm', '.mov', '.m4v', '.mkv', '.avi', '.flv', '.ogv'];
    if (videoExts.some((ext) => clean.endsWith(ext))) return true;
    if (clean.includes('youtube.com') || clean.includes('youtu.be') || clean.includes('vimeo.com') || clean.startsWith('data:video')) return true;
    return false;
  };

  const isImageUrlPattern = (urlStr) => {
    if (!urlStr) return false;
    const clean = urlStr.toLowerCase().trim().split('?')[0];
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif'];
    if (imageExts.some((ext) => clean.endsWith(ext))) return true;
    if (clean.includes('images.unsplash.com') || clean.includes('images.pexels.com') || clean.startsWith('data:image')) return true;
    return false;
  };

  const handleUrlInputChange = (newUrl) => {
    setUrl(newUrl);
    setPreviewDataUrl(newUrl);
    setErrorMessage('');

    if (sourceType === 'url' && newUrl) {
      if (isVideoUrlPattern(newUrl)) {
        setMediaType('VIDEO');
      } else if (isImageUrlPattern(newUrl)) {
        setMediaType('IMAGE');
      }
    }
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();

    if (mediaType !== 'BLANK' && !url) {
      setErrorMessage('Please select a local file or enter a valid URL.');
      return;
    }

    if (sourceType === 'url' && url) {
      if (mediaType === 'IMAGE' && isVideoUrlPattern(url)) {
        setErrorMessage('Selected media type is IMAGE, but the URL points to a VIDEO format (.mp4, .webm, YouTube, Vimeo, etc.). Please select VIDEO as media type.');
        return;
      }

      if (mediaType === 'VIDEO' && isImageUrlPattern(url)) {
        setErrorMessage('Selected media type is VIDEO, but the URL points to an IMAGE format (.jpg, .png, .gif, etc.). Please select IMAGE as media type.');
        return;
      }
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const newMedia = await onCreateMedia({
        title,
        mediaType,
        url: mediaType === 'BLANK' ? null : url,
        durationSeconds: Number(durationSeconds),
      });

      if (!isCatalogOnly && onAddMedia) {
        await onAddMedia(targetWindow.id, newMedia.id);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Error creating media asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isCatalogOnly ? 'Add New Catalog Asset' : `Add Media to "${targetWindow.name}"`}</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        {errorMessage && (
          <div className="modal-error-alert" style={{ color: '#ef4444', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {!isCatalogOnly && (
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalog')}
            >
              📋 Select from Catalog
            </button>
            <button
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              ✨ Create New Asset
            </button>
          </div>
        )}

        {activeTab === 'catalog' && !isCatalogOnly ? (
          <form onSubmit={handleSelectExisting} className="modal-body">
            <div className="form-group">
              <label>Select Catalog Item</label>
              <select
                value={selectedMediaId}
                onChange={(e) => setSelectedMediaId(e.target.value)}
                required
              >
                <option value="">-- Choose from existing media --</option>
                {mediaCatalog.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.mediaType} - {item.durationSeconds}s)
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add to Window Playlist'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateNew} className="modal-body">
            <div className="form-group">
              <label>Media Title</label>
              <input
                type="text"
                placeholder="e.g., Summer Sale Banner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Media Type</label>
              <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                <option value="IMAGE">IMAGE</option>
                <option value="VIDEO">VIDEO</option>
                <option value="BLANK">BLANK (Placeholder)</option>
              </select>
            </div>

            {mediaType !== 'BLANK' && (
              <div className="form-group">
                <label>Media Source</label>
                <div className="source-toggle-buttons">
                  <button
                    type="button"
                    className={`source-toggle-btn ${sourceType === 'file' ? 'active' : ''}`}
                    onClick={() => setSourceType('file')}
                  >
                    📁 Upload from Local System
                  </button>
                  <button
                    type="button"
                    className={`source-toggle-btn ${sourceType === 'url' ? 'active' : ''}`}
                    onClick={() => setSourceType('url')}
                  >
                    🌐 Public Web URL
                  </button>
                </div>

                {sourceType === 'file' ? (
                  <div className="file-upload-dropzone">
                    <input
                      type="file"
                      id="local-file-input"
                      accept={mediaType === 'VIDEO' ? 'video/*' : mediaType === 'IMAGE' ? 'image/*' : 'image/*,video/*'}
                      onChange={handleFileSelect}
                      className="hidden-file-input"
                    />
                    <label htmlFor="local-file-input" className="file-dropzone-label">
                      <span className="upload-cloud-icon">☁️</span>
                      {localFileName ? (
                        <div className="file-selected-info">
                          <strong>File Selected:</strong> {localFileName}
                          <span className="reselect-hint">Click to change file</span>
                        </div>
                      ) : (
                        <div className="upload-prompt">
                          <strong>Choose Local File</strong> or Drag & Drop here
                          <span>Supports MP4, WebM, PNG, JPG, GIF</span>
                        </div>
                      )}
                    </label>

                    {previewDataUrl && (
                      <div className="modal-media-preview-box">
                        <span className="preview-lbl">Local Preview:</span>
                        {mediaType === 'IMAGE' ? (
                          <img src={previewDataUrl} alt="Preview" className="preview-thumb-img" />
                        ) : (
                          <video src={previewDataUrl} controls className="preview-thumb-video" />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="url-input-box" style={{ marginTop: '0.5rem' }}>
                    <input
                      type="url"
                      placeholder="https://example.com/asset.mp4 or .jpg"
                      value={url}
                      onChange={(e) => handleUrlInputChange(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Duration (Seconds)</label>
              <input
                type="number"
                min="1"
                max="18000"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
                required
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : isCatalogOnly ? 'Create Catalog Item' : 'Create & Add to Playlist'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
