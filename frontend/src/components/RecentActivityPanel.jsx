import React from 'react';

export default function RecentActivityPanel({ activityLogs }) {
  const defaultLogs = [
    { id: 1, title: 'Sync playback started', detail: 'M2 - Ocean.mp4 (30s)', time: '04:25 PM', type: 'sync' },
    { id: 2, title: 'Playlist updated', detail: 'Window 2', time: '04:18 PM', type: 'playlist' },
    { id: 3, title: 'Media added', detail: 'M6 - City.jpg', time: '04:12 PM', type: 'media' },
    { id: 4, title: 'Window 3 settings updated', detail: 'Cycle: 5 hours', time: '03:50 PM', type: 'settings' },
    { id: 5, title: 'Sync playback completed', detail: 'M3 - Coffee.jpg', time: '03:42 PM', type: 'sync' }
  ];

  const logsToDisplay = activityLogs && activityLogs.length > 0 ? activityLogs : defaultLogs;

  return (
    <div className="panel-card activity-panel">
      <div className="panel-header">
        <span className="panel-header-icon">🕒</span>
        <h3>Recent Activity</h3>
      </div>

      <div className="panel-body">
        <ul className="activity-list">
          {logsToDisplay.map((log) => (
            <li key={log.id} className="activity-item">
              <span className="activity-dot"></span>
              <div className="activity-content">
                <span className="activity-title">{log.title}</span>
                <span className="activity-detail">{log.detail}</span>
                <span className="activity-time">{log.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
