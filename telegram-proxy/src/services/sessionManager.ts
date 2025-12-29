import { v4 as uuidv4 } from 'uuid';
import { Session, Message } from '../types';

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private chatIdToSession: Map<number, string> = new Map();
  private sessionTTL: number;

  constructor() {
    this.sessionTTL = (parseInt(process.env.SESSION_TTL_MINUTES || '30', 10)) * 60 * 1000;
    
    // Cleanup expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  createSession(metadata: Record<string, unknown> = {}): Session {
    const session: Session = {
      id: uuidv4(),
      chatId: null,
      createdAt: new Date(),
      lastActivity: new Date(),
      metadata,
    };

    this.sessions.set(session.id, session);
    this.messages.set(session.id, []);
    
    console.log(`📝 Session created: ${session.id}`);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
    return session;
  }

  getSessionByChatId(chatId: number): Session | undefined {
    const sessionId = this.chatIdToSession.get(chatId);
    if (sessionId) {
      return this.getSession(sessionId);
    }
    return undefined;
  }

  linkChatId(sessionId: string, chatId: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.chatId = chatId;
    this.chatIdToSession.set(chatId, sessionId);
    console.log(`🔗 Linked chatId ${chatId} to session ${sessionId}`);
    return true;
  }

  addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const fullMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    const sessionMessages = this.messages.get(sessionId) || [];
    sessionMessages.push(fullMessage);
    this.messages.set(sessionId, sessionMessages);

    // Update session activity
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }

    return fullMessage;
  }

  getMessages(sessionId: string): Message[] {
    return this.messages.get(sessionId) || [];
  }

  deleteSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (session.chatId) {
      this.chatIdToSession.delete(session.chatId);
    }
    this.sessions.delete(sessionId);
    this.messages.delete(sessionId);
    
    console.log(`🗑️ Session deleted: ${sessionId}`);
    return true;
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity.getTime() > this.sessionTTL) {
        this.deleteSession(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
    }
  }

  getActiveSessionCount(): number {
    return this.sessions.size;
  }
}
