import React from 'react';

export default function QuickActionsRow({ onOpenAddMediaModal, setActiveTab, onScrollToSync }) {
  const actions = [
    {
      id: 'add-media',
      title: 'Add Media',
      subtitle: 'Upload and add to playlists',
      icon: '🖼️',
      handler: onOpenAddMediaModal
    },
    {
      id: 'manage-windows',
      title: 'Manage Windows',
      subtitle: 'Configure window settings',
      icon: '🖥️',
      handler: () => setActiveTab('settings')
    },
    {
      id: 'sync-playback',
      title: 'Sync Playback',
      subtitle: 'Play selected media on all windows',
      icon: '🔗',
      handler: onScrollToSync
    },
    {
      id: 'media-library',
      title: 'Media Library',
      subtitle: 'View and manage all media',
      icon: '🖼️',
      handler: () => setActiveTab('library')
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      subtitle: 'Playback stats & logs',
      icon: '📊',
      handler: () => setActiveTab('analytics')
    }
  ];

  return (
    <div className="quick-actions-section">
      <div className="section-title-bar">
        <div className="title-with-icon">
          <span className="section-title-icon">⚡</span>
          <h2>Quick Actions</h2>
        </div>
      </div>

      <div className="quick-actions-5col-grid">
        {actions.map((act) => (
          <div key={act.id} className="quick-action-button-card" onClick={act.handler}>
            <div className="quick-action-icon-box">
              <span>{act.icon}</span>
            </div>
            <div className="quick-action-text-box">
              <h4>{act.title}</h4>
              <p>{act.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
