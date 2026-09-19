import React from 'react';

export default function AnalyticsSection() {
  return (
    <div className="analytics-view-container">
      <div className="section-title-bar">
        <div className="title-with-icon">
          <span className="section-title-icon">📊</span>
          <h2>System Analytics & Performance</h2>
        </div>
      </div>

      <div className="analytics-metrics-row">
        <div className="analytic-card">
          <span className="analytic-icon">⏱️</span>
          <div className="analytic-info">
            <span className="analytic-val">99.98%</span>
            <span className="analytic-lbl">System Uptime</span>
          </div>
        </div>

        <div className="analytic-card">
          <span className="analytic-icon">🔁</span>
          <div className="analytic-info">
            <span className="analytic-val">5.0 Hours</span>
            <span className="analytic-lbl">Continuous Loop Cycle</span>
          </div>
        </div>

        <div className="analytic-card">
          <span className="analytic-icon">⚡</span>
          <div className="analytic-info">
            <span className="analytic-val">0ms</span>
            <span className="analytic-lbl">Sync Latency</span>
          </div>
        </div>

        <div className="analytic-card">
          <span className="analytic-icon">💾</span>
          <div className="analytic-info">
            <span className="analytic-val">4 / 4</span>
            <span className="analytic-lbl">Active Displays</span>
          </div>
        </div>
      </div>

      <div className="analytics-detail-card">
        <h3>5-Hour Cycle Timeline Engine</h3>
        <p className="analytics-explain">
          Calculates continuous sequence offsets using modular math algorithm: <code>elapsedSeconds = currentTime % 18000s</code>.
          Guarantees zero drift synchronization across all active display windows regardless of backend restart or page reloads.
        </p>
      </div>
    </div>
  );
}
