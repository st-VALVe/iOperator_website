import TelegramBot from 'node-telegram-bot-api';
import { SessionManager } from './sessionManager';

export class TelegramService {
  private bot: TelegramBot | null = null;
  private sessionManager: SessionManager;
  private messageCallbacks: Map<string, (message: string, metadata?: Record<string, unknown>) => void> = new Map();

  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
    this.initBot();
  }

  private initBot(): void {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN not set. Bot functionality disabled.');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      
      this.bot.on('message', (msg) => this.handleIncomingMessage(msg));
      this.bot.on('polling_error', (error) => {
        console.error('Telegram polling error:', error.message);
      });

      console.log('🤖 Telegram bot initialized');
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error);
    }
  }

  private handleIncomingMessage(msg: TelegramBot.Message): void {
    const chatId = msg.chat.id;
    const session = this.sessionManager.getSessionByChatId(chatId);

    if (!session) {
      // Message from unknown chat, ignore or handle differently
      console.log(`📨 Message from unknown chatId: ${chatId}`);
      return;
    }

    let content = '';
    let type: 'text' | 'voice' | 'image' = 'text';
    const metadata: Record<string, unknown> = {};

    if (msg.text) {
      content = msg.text;
      type = 'text';
    } else if (msg.voice) {
      content = '[Voice message]';
      type = 'voice';
      metadata.voiceFileId = msg.voice.file_id;
      metadata.duration = msg.voice.duration;
    } else if (msg.photo) {
      content = msg.caption || '[Photo]';
      type = 'image';
      metadata.photoFileId = msg.photo[msg.photo.length - 1].file_id;
    }

    // Store message
    const storedMessage = this.sessionManager.addMessage(session.id, {
      sessionId: session.id,
      type,
      content,
      sender: 'bot',
      metadata,
    });

    // Notify callback
    const callback = this.messageCallbacks.get(session.id);
    if (callback) {
      callback(content, { ...metadata, messageId: storedMessage.id, type });
    }
  }

  async sendMessage(sessionId: string, text: string): Promise<boolean> {
    const session = this.sessionManager.getSession(sessionId);
    
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      return false;
    }

    if (!this.bot) {
      console.error('Telegram bot not initialized');
      return false;
    }

    // For demo purposes, we'll simulate the bot interaction
    // In production, this would send to the actual Telegram bot
    // and the bot would process and respond

    // Store user message
    this.sessionManager.addMessage(sessionId, {
      sessionId,
      type: 'text',
      content: text,
      sender: 'user',
    });

    // Simulate bot response (in production, this comes from the actual bot)
    setTimeout(() => {
      const responses = [
        "Здравствуйте! Чем могу помочь?",
        "Спасибо за ваше сообщение. Наш оператор скоро ответит.",
        "Вы можете посмотреть наше меню или задать вопрос.",
        "Отличный выбор! Хотите оформить заказ?",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const botMessage = this.sessionManager.addMessage(sessionId, {
        sessionId,
        type: 'text',
        content: randomResponse,
        sender: 'bot',
      });

      const callback = this.messageCallbacks.get(sessionId);
      if (callback) {
        callback(randomResponse, { messageId: botMessage.id, type: 'text' });
      }
    }, 1000 + Math.random() * 1000);

    return true;
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

    // Simulate bot response to voice
    setTimeout(() => {
      const botMessage = this.sessionManager.addMessage(sessionId, {
        sessionId,
        type: 'text',
        content: 'Я получил ваше голосовое сообщение. Обрабатываю...',
        sender: 'bot',
      });

      const callback = this.messageCallbacks.get(sessionId);
      if (callback) {
        callback('Я получил ваше голосовое сообщение. Обрабатываю...', { 
          messageId: botMessage.id, 
          type: 'text' 
        });
      }
    }, 1500);

    return true;
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

    // Simulate bot response to image
    setTimeout(() => {
      const botMessage = this.sessionManager.addMessage(sessionId, {
        sessionId,
        type: 'text',
        content: 'Спасибо за изображение! Анализирую...',
        sender: 'bot',
      });

      const callback = this.messageCallbacks.get(sessionId);
      if (callback) {
        callback('Спасибо за изображение! Анализирую...', { 
          messageId: botMessage.id, 
          type: 'text' 
        });
      }
    }, 1500);

    return true;
  }

  onMessage(sessionId: string, callback: (message: string, metadata?: Record<string, unknown>) => void): void {
    this.messageCallbacks.set(sessionId, callback);
  }

  removeMessageCallback(sessionId: string): void {
    this.messageCallbacks.delete(sessionId);
  }
}
