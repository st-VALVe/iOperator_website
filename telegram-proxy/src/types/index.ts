export interface Session {
  id: string;
  chatId: number | null;
  createdAt: Date;
  lastActivity: Date;
  metadata: Record<string, unknown>;
}

export interface Message {
  id: string;
  sessionId: string;
  type: 'text' | 'voice' | 'image';
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'error' | 'connected' | 'session_update';
  payload: unknown;
}

export interface CreateSessionResponse {
  sessionId: string;
  wsUrl: string;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId: string;
}

export interface SendAudioRequest {
  sessionId: string;
  audio: string; // base64 encoded
  mimeType: string;
}

export interface SendImageRequest {
  sessionId: string;
  image: string; // base64 encoded
  mimeType: string;
  caption?: string;
}
