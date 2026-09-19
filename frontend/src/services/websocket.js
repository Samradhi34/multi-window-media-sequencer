/**
 * Real-Time WebSocket Client for Multi-Window Media Sequencer
 * Connects to Spring Boot STOMP Message Broker over WebSocket
 */
class SequencerWebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.playbackSubscribers = new Set();
    this.syncSubscribers = new Set();
    this.reconnectTimer = null;
  }

  connect(host = window.location.hostname || 'localhost', port = '8080') {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    const wsUrl = `ws://${host}:${port}/ws-sequencer-raw`;
    console.log('[WebSocket] Connecting to STOMP broker at:', wsUrl);

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[WebSocket] Socket connection established. Sending STOMP CONNECT frame...');
        // Send STOMP CONNECT frame
        const connectFrame = "CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\0";
        this.socket.send(connectFrame);
      };

      this.socket.onmessage = (event) => {
        const data = event.data;
        if (data.startsWith('CONNECTED')) {
          console.log('[WebSocket] STOMP CONNECTED! Subscribing to /topic/playback & /topic/sync...');
          this.isConnected = true;

          // Subscribe to /topic/playback
          const subPlayback = "SUBSCRIBE\nid:sub-playback\ndestination:/topic/playback\n\n\0";
          this.socket.send(subPlayback);

          // Subscribe to /topic/sync
          const subSync = "SUBSCRIBE\nid:sub-sync\ndestination:/topic/sync\n\n\0";
          this.socket.send(subSync);
          return;
        }

        if (data.startsWith('MESSAGE')) {
          this.handleStompMessage(data);
        }
      };

      this.socket.onclose = () => {
        console.warn('[WebSocket] Connection closed. Retrying in 3 seconds...');
        this.isConnected = false;
        this.scheduleReconnect(host, port);
      };

      this.socket.onerror = (err) => {
        console.error('[WebSocket] Error encountered:', err);
        this.socket.close();
      };
    } catch (e) {
      console.error('[WebSocket] Failed to initialize WebSocket:', e);
      this.scheduleReconnect(host, port);
    }
  }

  handleStompMessage(rawFrame) {
    try {
      const bodyIndex = rawFrame.indexOf('\n\n');
      if (bodyIndex === -1) return;

      const headersStr = rawFrame.substring(0, bodyIndex);
      let body = rawFrame.substring(bodyIndex + 2);
      if (body.endsWith('\0')) {
        body = body.substring(0, body.length - 1);
      }

      const json = JSON.parse(body);

      if (headersStr.includes('destination:/topic/playback')) {
        this.playbackSubscribers.forEach((cb) => cb(json));
      } else if (headersStr.includes('destination:/topic/sync')) {
        this.syncSubscribers.forEach((cb) => cb(json));
      }
    } catch (err) {
      // Non-JSON or parse skip
    }
  }

  subscribePlayback(callback) {
    this.playbackSubscribers.add(callback);
    return () => this.playbackSubscribers.delete(callback);
  }

  subscribeSync(callback) {
    this.syncSubscribers.add(callback);
    return () => this.syncSubscribers.delete(callback);
  }

  scheduleReconnect(host, port) {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect(host, port);
    }, 3000);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

export const wsClient = new SequencerWebSocketClient();
