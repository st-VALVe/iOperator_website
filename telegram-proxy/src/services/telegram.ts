import { SessionManager } from './sessionManager.js';
import { OpenAIService } from './openai.js';

export class TelegramService {
  private sessionManager: SessionManager;
  private openaiService: OpenAIService;
  private messageCallbacks: Map<string, (message: string, metadata?: Record<string, unknown>) => void> = new Map();

  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
    this.openaiService = new OpenAIService(sessionManager);
    console.log('🤖 Telegram bot initialized');
  }

  async sendMessage(sessionId: string, text: string): Promise<boolean> {
    const session = this.sessionManager.getSession(sessionId);
    
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      return false;
    }

    // Store user message
    this.sessionManager.addMessage(sessionId, {
      sessionId,
      type: 'text',
      content: text,
      sender: 'user',
    });

    // Notify typing
    const callback = this.messageCallbacks.get(sessionId);
    
    try {
      // Get response from OpenAI
      const response = await this.openaiService.chat(sessionId, text);

      // Store bot message
      const botMessage = this.sessionManager.addMessage(sessionId, {
        sessionId,
        type: 'text',
        content: response,
        sender: 'bot',
      });

      // Send response to client
      if (callback) {
        callback(response, { messageId: botMessage.id, type: 'text' });
      }

      return true;
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const errorMessage = 'Извините, произошла ошибка. Попробуйте ещё раз.';
      const botMessage = this.sessionManager.addMessage(sessionId, {
        sessionId,
        type: 'text',
        content: errorMessage,
        sender: 'bot',
      });

      if (callback) {
        callback(errorMessage, { messageId: botMessage.id, type: 'text' });
      }

      return false;
    }
  }

  async sendAudio(sessionId: string, audioBase64: string, mimeType: string): Promise<boolean> {
    const session = this.sessionManager.getSession(sessionId);
    
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      return false;
    }

    // Store user voice message
    this.sessionManager.addMessage(sessionId, {
      sessionId,
      type: 'voice',
      content: '[Voice message]',
      sender: 'user',
      metadata: { mimeType },
    });

    const callback = this.messageCallbacks.get(sessionId);

    try {
      // Get response from OpenAI
      const response = await this.openaiService.handleVoice(sessionId);

      const botMessage = this.sessionManager.addMessage(sessionId, {
        sessionId,
        type: 'text',
        content: response,
        sender: 'bot',
      });

      if (callback) {
        callback(response, { messageId: botMessage.id, type: 'text' });
      }

      return true;
    } catch (error) {
      console.error('Failed to handle voice:', error);
      return false;
    }
  }

  async sendImage(sessionId: string, imageBase64: string, mimeType: string, caption?: string): Promise<boolean> {
    const session = this.sessionManager.getSession(sessionId);
    
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      return false;
    }

    // Store user image message
    this.sessionManager.addMessage(sessionId, {
      sessionId,
      type: 'image',
      content: caption || '[Image]',
      sender: 'user',
      metadata: { mimeType },
    });

    const callback = this.messageCallbacks.get(sessionId);

    try {
      // Get response from OpenAI
      const response = await this.openaiService.handleImage(sessionId, caption);

      const botMessage = this.sessionManager.addMessage(sessionId, {
        sessionId,
        type: 'text',
        content: response,
        sender: 'bot',
      });

      if (callback) {
        callback(response, { messageId: botMessage.id, type: 'text' });
      }

      return true;
    } catch (error) {
      console.error('Failed to handle image:', error);
      return false;
    }
  }

  onMessage(sessionId: string, callback: (message: string, metadata?: Record<string, unknown>) => void): void {
    this.messageCallbacks.set(sessionId, callback);
  }

  removeMessageCallback(sessionId: string): void {
    this.messageCallbacks.delete(sessionId);
    this.openaiService.clearHistory(sessionId);
  }
}
