const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalDev ? 'http://localhost:8080/api' : `${window.location.origin}/api`;

async function fetchWithRetry(url, options = {}, retries = 6, delayMs = 2000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      // Retry if server returns cold-start gateway error codes (502, 503, 504) while restarting
      if ((response.status === 502 || response.status === 503 || response.status === 504) && i < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      return response;
    } catch (err) {
      if (i === retries) {
        throw new Error('Server starting up or connection busy. Please retry in a few seconds.');
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
  }
  const result = await response.json();
  return result.data;
}

export const api = {
  // Playback & Windows
  getAllWindowsPlayback: async () => {
    const res = await fetchWithRetry(`${API_BASE_URL}/windows/playback`);
    return handleResponse(res);
  },

  getWindowPlayback: async (windowId) => {
    const res = await fetchWithRetry(`${API_BASE_URL}/windows/${windowId}/playback`);
    return handleResponse(res);
  },

  createWindow: async (windowData) => {
    const res = await fetchWithRetry(`${API_BASE_URL}/windows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(windowData),
    });
    return handleResponse(res);
  },

  deleteWindow: async (windowId) => {
    const res = await fetchWithRetry(`${API_BASE_URL}/windows/${windowId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  addMediaToWindow: async (windowId, mediaId) => {
    const res = await fetchWithRetry(`${API_BASE_URL}/windows/${windowId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId }),
    });
    return handleResponse(res);
  },

  removeMediaFromWindow: async (windowId, mediaId) => {
    const res = await fetchWithRetry(`${API_BASE_URL}/windows/${windowId}/media/${mediaId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  movePlaylistItem: async (windowId, mediaId, direction) => {
    const res = await fetchWithRetry(`${API_BASE_URL}/windows/${windowId}/media/${mediaId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    return handleResponse(res);
  },

  // Media Catalog
  getMediaCatalog: async () => {
    const res = await fetchWithRetry(`${API_BASE_URL}/media`);
    return handleResponse(res);
  },

  createMediaItem: async (mediaData) => {
    const res = await fetchWithRetry(`${API_BASE_URL}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mediaData),
    });
    return handleResponse(res);
  },

  updateMediaDuration: async (mediaId, durationSeconds) => {
    const res = await fetchWithRetry(`${API_BASE_URL}/media/${mediaId}/duration`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationSeconds: Number(durationSeconds) }),
    });
    return handleResponse(res);
  },

  deleteMediaItem: async (mediaId) => {
    const res = await fetchWithRetry(`${API_BASE_URL}/media/${mediaId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Global Sync
  getSyncStatus: async () => {
    const res = await fetchWithRetry(`${API_BASE_URL}/sync`);
    return handleResponse(res);
  },

  triggerSync: async (mediaId, durationSeconds) => {
    const res = await fetchWithRetry(`${API_BASE_URL}/sync/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId, durationSeconds: Number(durationSeconds) }),
    });
    return handleResponse(res);
  },

  cancelSync: async () => {
    const res = await fetchWithRetry(`${API_BASE_URL}/sync/cancel`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
