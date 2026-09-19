import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import WelcomeHeader from './components/WelcomeHeader';
import LiveWindowPreview from './components/LiveWindowPreview';
import SyncPlaybackPanel from './components/SyncPlaybackPanel';
import RecentActivityPanel from './components/RecentActivityPanel';
import MediaLibrarySection from './components/MediaLibrarySection';
import WindowPlaylistsSection from './components/WindowPlaylistsSection';
import WindowSettingsSection from './components/WindowSettingsSection';
import AnalyticsSection from './components/AnalyticsSection';
import QuickActionsRow from './components/QuickActionsRow';
import Footer from './components/Footer';
import AddMediaModal from './components/AddMediaModal';
import AddWindowModal from './components/AddWindowModal';
import { api } from './services/api';
import { wsClient } from './services/websocket';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [windowStatuses, setWindowStatuses] = useState([]);
  const [mediaCatalog, setMediaCatalog] = useState([]);
  const [syncStatus, setSyncStatus] = useState({ isActive: false, remainingSeconds: 0 });
  const [isConnected, setIsConnected] = useState(true);
  const [isWebSocketActive, setIsWebSocketActive] = useState(false);
  const [serverTimeMs, setServerTimeMs] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);

  // Modal State
  const [targetWindow, setTargetWindow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddWindowModalOpen, setIsAddWindowModalOpen] = useState(false);

  // Mobile Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const topSyncRef = useRef(null);

  // Helper to append log entry
  const logEvent = (title, detail, type = 'info') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setActivityLogs((prev) => [
      { id: Date.now(), title, detail, time: timeStr, type },
      ...prev.slice(0, 9)
    ]);
  };

  // Fetch live window playback states & sync status
  const refreshPlayback = useCallback(async () => {
    try {
      const statuses = await api.getAllWindowsPlayback();
      if (Array.isArray(statuses) && statuses.length > 0 && statuses[0].serverTimeMs) {
        setServerTimeMs(statuses[0].serverTimeMs);
      }
      setWindowStatuses((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(statuses)) {
          return prev;
        }
        return statuses;
      });

      const isAnySyncActive = statuses && statuses.some((s) => s.isSyncActive);
      if (isAnySyncActive) {
        const sync = await api.getSyncStatus();
        setSyncStatus((prev) => {
          if (prev.isActive === sync.isActive && prev.remainingSeconds === sync.remainingSeconds && prev.activeMediaItem?.id === sync.activeMediaItem?.id) {
            return prev;
          }
          return sync;
        });
      } else {
        setSyncStatus((prev) => {
          if (!prev.isActive && prev.remainingSeconds === 0) return prev;
          return { isActive: false, remainingSeconds: 0, activeMediaItem: null };
        });
      }

      setIsConnected(true);
    } catch (err) {
      console.error('Failed to fetch playback status:', err);
      setIsConnected(false);
    }
  }, []);

  // Fetch media catalog
  const loadCatalog = useCallback(async () => {
    try {
      const catalog = await api.getMediaCatalog();
      setMediaCatalog(catalog);
    } catch (err) {
      console.error('Failed to load media catalog:', err);
    }
  }, []);

  // Real-Time WebSocket Connection & Subscription with Fallback Polling
  useEffect(() => {
    loadCatalog();

    // Connect to STOMP WebSocket broker
    wsClient.connect();

    const unsubscribePlayback = wsClient.subscribePlayback((statuses) => {
      if (Array.isArray(statuses)) {
        setIsWebSocketActive(true);
        setIsConnected(true);
        if (statuses.length > 0 && statuses[0].serverTimeMs) {
          setServerTimeMs(statuses[0].serverTimeMs);
        }
        setWindowStatuses((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(statuses)) return prev;
          return statuses;
        });
      }
    });

    const unsubscribeSync = wsClient.subscribeSync((syncData) => {
      if (syncData) {
        setSyncStatus((prev) => {
          if (prev.isActive === syncData.isActive && prev.remainingSeconds === syncData.remainingSeconds) return prev;
          return syncData;
        });
      }
    });

    // Fallback polling loop
    let isMounted = true;
    let timerId = null;

    const poll = async () => {
      if (!wsClient.isConnected) {
        await refreshPlayback();
      }
      if (isMounted) {
        timerId = setTimeout(poll, 1000);
      }
    };

    poll();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
      unsubscribePlayback();
      unsubscribeSync();
    };
  }, [refreshPlayback, loadCatalog]);

  // Global Sync Handlers
  const handleTriggerSync = async (mediaId, durationSeconds) => {
    const mediaItem = mediaCatalog.find((m) => m.id === Number(mediaId) || m.id === mediaId);
    const mediaTitle = mediaItem ? mediaItem.title : 'Media Item';

    await api.triggerSync(mediaId, durationSeconds);
    logEvent('Sync playback started', `${mediaTitle} (${durationSeconds}s)`, 'sync');
    await refreshPlayback();
  };

  const handleCancelSync = async () => {
    await api.cancelSync();
    logEvent('Sync playback stopped', 'Returned to sequence playlists', 'sync');
    await refreshPlayback();
  };

  // Modal & Playlist Handlers
  const handleOpenAddMediaForWindow = (windowId, windowName) => {
    setTargetWindow({ id: windowId, name: windowName });
    setIsModalOpen(true);
  };

  const handleOpenAddMediaModal = () => {
    setTargetWindow(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTargetWindow(null);
  };

  const handleOpenAddWindowModal = () => {
    setIsAddWindowModalOpen(true);
  };

  const handleCloseAddWindowModal = () => {
    setIsAddWindowModalOpen(false);
  };

  const handleCreateWindowItem = async (windowData) => {
    const newWindow = await api.createWindow(windowData);
    logEvent('Window created', `${newWindow.name}`, 'window');
    await refreshPlayback();
    return newWindow;
  };

  const handleDeleteWindowItem = async (windowId) => {
    try {
      await api.deleteWindow(windowId);
      logEvent('Window deleted', `Window ID: ${windowId}`, 'window');
      await refreshPlayback();
    } catch (err) {
      console.error('Failed to delete display window:', err);
      alert(err.message || 'Failed to delete display window');
    }
  };

  const handleAddMediaToWindow = async (windowId, mediaId) => {
    await api.addMediaToWindow(windowId, mediaId);
    logEvent('Playlist updated', `Window ${windowId}`, 'playlist');
    await refreshPlayback();
  };

  const handleRemoveMediaFromWindow = async (windowId, mediaId) => {
    await api.removeMediaFromWindow(windowId, mediaId);
    logEvent('Media removed', `Window ${windowId}`, 'playlist');
    await refreshPlayback();
  };

  const handleCreateMediaItem = async (mediaData) => {
    const newMedia = await api.createMediaItem(mediaData);
    logEvent('Media added', `${newMedia.title}`, 'media');
    await loadCatalog();
    return newMedia;
  };

  const handleDeleteMediaItem = async (mediaId) => {
    try {
      await api.deleteMediaItem(mediaId);
      logEvent('Media deleted', `Media ID: ${mediaId}`, 'media');
      await loadCatalog();
      await refreshPlayback();
    } catch (err) {
      console.error('Failed to delete media item:', err);
      alert(err.message || 'Failed to delete media asset');
    }
  };

  const handleMovePlaylistItem = async (windowId, mediaId, direction) => {
    try {
      await api.movePlaylistItem(windowId, mediaId, direction);
      logEvent('Playlist reordered', `Window ${windowId} (${direction})`, 'playlist');
      await refreshPlayback();
    } catch (err) {
      console.error('Failed to move playlist item:', err);
    }
  };

  const handleUpdateMediaDuration = async (mediaId, newDuration) => {
    try {
      await api.updateMediaDuration(mediaId, newDuration);
      logEvent('Duration updated', `Media ID ${mediaId} (${newDuration}s)`, 'playlist');
      await loadCatalog();
      await refreshPlayback();
    } catch (err) {
      console.error('Failed to update duration:', err);
      alert(err.message || 'Failed to update duration');
    }
  };

  const handleScrollToSync = () => {
    setActiveTab('sync');
    if (topSyncRef.current) {
      topSyncRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="media-sequencer-root">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        totalMediaCount={mediaCatalog.length}
        windowCount={windowStatuses.length || 3}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Right Content Section */}
      <div className="main-content-layout">
        {/* Top Header Bar */}
        <TopHeader
          isConnected={isConnected}
          isWebSocketActive={isWebSocketActive}
          serverTimeMs={serverTimeMs}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Dashboard Body Container */}
        <div className="dashboard-body-container">
          <div ref={topSyncRef}>
            <WelcomeHeader
              mediaCount={mediaCatalog.length}
              isSyncActive={syncStatus.isActive}
              windowCount={windowStatuses.length || 3}
              onCancelSync={handleCancelSync}
              onNavigateSync={handleScrollToSync}
            />
          </div>

          {/* Tab View Switcher */}
          {activeTab === 'dashboard' && (
            <>
              <div className="primary-dashboard-grid">
                <div className="main-grid-left-col">
                  <LiveWindowPreview
                    windowStatuses={windowStatuses}
                    mediaCatalog={mediaCatalog}
                    onOpenAddWindow={handleOpenAddWindowModal}
                    onDeleteWindow={handleDeleteWindowItem}
                  />
                  <div className="middle-3col-grid">
                    <MediaLibrarySection
                      mediaCatalog={mediaCatalog}
                      onOpenAddMediaModal={handleOpenAddMediaModal}
                      onDeleteMedia={handleDeleteMediaItem}
                    />
                    <WindowPlaylistsSection
                      windowStatuses={windowStatuses}
                      mediaCatalog={mediaCatalog}
                      onOpenAddMedia={handleOpenAddMediaForWindow}
                      onRemoveMedia={handleRemoveMediaFromWindow}
                      onMoveMedia={handleMovePlaylistItem}
                      onUpdateDuration={handleUpdateMediaDuration}
                      onDeleteWindow={handleDeleteWindowItem}
                    />
                    <WindowSettingsSection
                      windowStatuses={windowStatuses}
                      onDeleteWindow={handleDeleteWindowItem}
                    />
                  </div>
                </div>
                <div className="main-grid-right-col">
                  <SyncPlaybackPanel
                    mediaCatalog={mediaCatalog}
                    syncStatus={syncStatus}
                    onTriggerSync={handleTriggerSync}
                    onCancelSync={handleCancelSync}
                  />
                  <RecentActivityPanel activityLogs={activityLogs} />
                </div>
              </div>

              <QuickActionsRow
                onOpenAddMediaModal={handleOpenAddMediaModal}
                setActiveTab={setActiveTab}
                onScrollToSync={handleScrollToSync}
              />
            </>
          )}

          {activeTab === 'windows' && (
            <div className="dedicated-tab-view windows-tab-view">
              <div className="view-banner-header">
                <h2>Display Windows Manager</h2>
                <p>Live playback monitoring, sequence execution, and display controls</p>
              </div>
              <LiveWindowPreview
                windowStatuses={windowStatuses}
                mediaCatalog={mediaCatalog}
                onOpenAddWindow={handleOpenAddWindowModal}
                onDeleteWindow={handleDeleteWindowItem}
              />
              <div className="view-secondary-section" style={{ marginTop: '1.5rem' }}>
                <WindowPlaylistsSection
                  windowStatuses={windowStatuses}
                  mediaCatalog={mediaCatalog}
                  onOpenAddMedia={handleOpenAddMediaForWindow}
                  onRemoveMedia={handleRemoveMediaFromWindow}
                  onMoveMedia={handleMovePlaylistItem}
                  onUpdateDuration={handleUpdateMediaDuration}
                  onDeleteWindow={handleDeleteWindowItem}
                />
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="dedicated-tab-view library-tab-view">
              <div className="view-banner-header">
                <h2>Media Library Catalog</h2>
                <p>Manage, upload, and organize all repository media assets</p>
              </div>
              <div className="full-width-library-wrapper">
                <MediaLibrarySection
                  mediaCatalog={mediaCatalog}
                  onOpenAddMediaModal={handleOpenAddMediaModal}
                  onDeleteMedia={handleDeleteMediaItem}
                />
              </div>
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="dedicated-tab-view playlists-tab-view">
              <div className="view-banner-header">
                <h2>Window Playlists & Queues</h2>
                <p>Configure play sequence, item durations, and playlist queues per display window</p>
              </div>
              <div className="full-width-playlists-wrapper">
                <WindowPlaylistsSection
                  windowStatuses={windowStatuses}
                  mediaCatalog={mediaCatalog}
                  onOpenAddMedia={handleOpenAddMediaForWindow}
                  onRemoveMedia={handleRemoveMediaFromWindow}
                  onMoveMedia={handleMovePlaylistItem}
                  onUpdateDuration={handleUpdateMediaDuration}
                  onDeleteWindow={handleDeleteWindowItem}
                />
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="dedicated-tab-view sync-tab-view">
              <div className="view-banner-header">
                <h2>Sync Playback Command Center</h2>
                <p>Broadcast synchronized media across all display windows simultaneously</p>
              </div>
              <div className="sync-view-grid">
                <SyncPlaybackPanel
                  mediaCatalog={mediaCatalog}
                  syncStatus={syncStatus}
                  onTriggerSync={handleTriggerSync}
                  onCancelSync={handleCancelSync}
                />
                <RecentActivityPanel activityLogs={activityLogs} />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsSection />
          )}

          {activeTab === 'settings' && (
            <div className="dedicated-tab-view settings-tab-view">
              <div className="view-banner-header">
                <h2>System & Window Settings</h2>
                <p>Configure window names, cycle parameters, playback transitions, and display preferences</p>
              </div>
              <div className="settings-view-wrapper" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <WindowSettingsSection
                  windowStatuses={windowStatuses}
                  onDeleteWindow={handleDeleteWindowItem}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <Footer />
      </div>

      {/* Add Media Modal */}
      {isModalOpen && (
        <AddMediaModal
          targetWindow={targetWindow}
          mediaCatalog={mediaCatalog}
          onClose={handleCloseModal}
          onAddMedia={handleAddMediaToWindow}
          onCreateMedia={handleCreateMediaItem}
        />
      )}

      {/* Add Display Window Modal */}
      {isAddWindowModalOpen && (
        <AddWindowModal
          onClose={handleCloseAddWindowModal}
          onCreateWindow={handleCreateWindowItem}
          existingWindowCount={windowStatuses.length}
        />
      )}
    </div>
  );
}
