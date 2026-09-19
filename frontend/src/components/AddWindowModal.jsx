import React, { useState } from 'react';

export default function AddWindowModal({ onClose, onCreateWindow }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter a display window name.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await onCreateWindow({
        name: name.trim(),
        description: description.trim() || 'Dynamic Display Screen'
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Error creating display window');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <h3>🖥️ Add New Display Window</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        {errorMessage && (
          <div className="modal-error-alert" style={{ color: '#ef4444', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', margin: '0.5rem 0' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Window Name</label>
            <input
              type="text"
              placeholder="e.g., Window 4 (Executive Lounge)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description / Location</label>
            <input
              type="text"
              placeholder="e.g., High-resolution feature display screen"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : '+ Create Display Window'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
