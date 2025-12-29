const API_BASE = import.meta.env.VITE_TELEGRAM_PROXY_URL || 'http://localhost:3001';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'voice' | 'image';
}

export interface Session {
  sessionId: string;
  wsUrl: string;
}

class TelegramProxyService {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private wsUrl: string | null = null;
  private messageCallbacks: ((message: Message) => void)[] = [];
  private typingCallbacks: ((isTyping: boolean) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  async createSession(): Promise<Session> {
    // Reuse existing session if available
    if (this.sessionId && this.wsUrl) {
      return { sessionId: this.sessionId, wsUrl: this.wsUrl };
    }

    const response = await fetch(`${API_BASE}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { source: 'web-widget' } }),
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    const session: Session = await response.json();
    this.sessionId = session.sessionId;
    this.wsUrl = session.wsUrl;
    
    return session;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connectWebSocket(wsUrl: string): void {
    // Don't reconnect if already connected or connecting
    if (this.isConnecting || this.isConnected()) {
      return;
    }

    if (this.ws) {
      this.ws.close();
    }

    this.isConnecting = true;

    // Convert ws URL to use current host in development
    const url = wsUrl.replace('ws://localhost:3001', API_BASE.replace('http', 'ws'));
    
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.connectionCallbacks.forEach(cb => cb(true));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnecting = false;
      this.connectionCallbacks.forEach(cb => cb(false));
      // Only reconnect if we have a valid session
      if (this.sessionId && this.wsUrl) {
        this.attemptReconnect(this.wsUrl);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };
  }

  private handleWebSocketMessage(data: { type: string; payload: unknown }): void {
    switch (data.type) {
      case 'message': {
        const payload = data.payload as {
          content: string;
          sender: 'user' | 'bot';
          timestamp: string;
          messageId?: string;
          type?: 'text' | 'voice' | 'image';
        };
        
        const message: Message = {
          id: payload.messageId || Date.now().toString(),
          content: payload.content,
          sender: payload.sender,
          timestamp: new Date(payload.timestamp),
          type: payload.type || 'text',
        };
        
        this.messageCallbacks.forEach(cb => cb(message));
        break;
      }
      case 'typing': {
        const payload = data.payload as { isTyping: boolean };
        this.typingCallbacks.forEach(cb => cb(payload.isTyping));
        break;
      }
      case 'connected':
        console.log('Session connected:', data.payload);
        break;
      case 'error':
        console.error('Server error:', data.payload);
        break;
    }
  }

  private attemptReconnect(wsUrl: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => this.connectWebSocket(wsUrl), delay);
  }

  async sendMessage(message: string): Promise<boolean> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${API_BASE}/api/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: this.sessionId, message }),
    });

    return response.ok;
  }

  async sendAudio(audioBlob: Blob): Promise<boolean> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const base64 = await this.blobToBase64(audioBlob);
    
    const response = await fetch(`${API_BASE}/api/message/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        audio: base64,
        mimeType: audioBlob.type,
      }),
    });

    return response.ok;
  }

  async sendImage(imageBlob: Blob, caption?: string): Promise<boolean> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const base64 = await this.blobToBase64(imageBlob);
    
    const response = await fetch(`${API_BASE}/api/message/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        image: base64,
        mimeType: imageBlob.type,
        caption,
      }),
    });

    return response.ok;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  onMessage(callback: (message: Message) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onTyping(callback: (isTyping: boolean) => void): () => void {
    this.typingCallbacks.push(callback);
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
    };
  }

  onConnection(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnect
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.sessionId = null;
    this.wsUrl = null;
    this.isConnecting = false;
    this.messageCallbacks = [];
    this.typingCallbacks = [];
    this.connectionCallbacks = [];
    this.reconnectAttempts = 0;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}

export const telegramProxy = new TelegramProxyService();
