import { WebSocketServer, WebSocket } from 'ws';
import { SessionManager } from './sessionManager';
import { WebSocketMessage } from '../types';

interface ClientConnection {
  ws: WebSocket;
  sessionId: string;
}

export class WebSocketHandler {
  private wss: WebSocketServer;
  private sessionManager: SessionManager;
  private clients: Map<string, ClientConnection> = new Map();

  constructor(wss: WebSocketServer, sessionManager: SessionManager) {
    this.wss = wss;
    this.sessionManager = sessionManager;
    this.init();
  }

  private init(): void {
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const sessionId = url.searchParams.get('sessionId');

      if (!sessionId) {
        ws.close(4001, 'Session ID required');
        return;
      }

      const session = this.sessionManager.getSession(sessionId);
      if (!session) {
        ws.close(4002, 'Invalid session');
        return;
      }

      // Store client connection
      this.clients.set(sessionId, { ws, sessionId });
      console.log(`🔌 WebSocket connected for session: ${sessionId}`);

      // Send connected message
      this.sendToClient(sessionId, {
        type: 'connected',
        payload: { sessionId, timestamp: new Date().toISOString() },
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(sessionId, message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        this.clients.delete(sessionId);
        console.log(`🔌 WebSocket disconnected for session: ${sessionId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for session ${sessionId}:`, error);
        this.clients.delete(sessionId);
      });
    });
  }

  private handleClientMessage(sessionId: string, message: WebSocketMessage): void {
    switch (message.type) {
      case 'typing':
        // Could broadcast typing indicator to other clients if needed
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  sendToClient(sessionId: string, message: WebSocketMessage): boolean {
    const client = this.clients.get(sessionId);
    
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`Failed to send message to session ${sessionId}:`, error);
      return false;
    }
  }

  sendMessage(sessionId: string, content: string, metadata?: Record<string, unknown>): void {
    this.sendToClient(sessionId, {
      type: 'message',
      payload: {
        content,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  }

  sendTyping(sessionId: string, isTyping: boolean): void {
    this.sendToClient(sessionId, {
      type: 'typing',
      payload: { isTyping },
    });
  }

  sendError(sessionId: string, error: string): void {
    this.sendToClient(sessionId, {
      type: 'error',
      payload: { error, timestamp: new Date().toISOString() },
    });
  }

  isConnected(sessionId: string): boolean {
    const client = this.clients.get(sessionId);
    return client?.ws.readyState === WebSocket.OPEN;
  }

  getConnectedCount(): number {
    return this.clients.size;
  }
}
