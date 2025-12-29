import { Router, Request, Response } from 'express';
import { TelegramService } from '../services/telegram';
import { WebSocketHandler } from '../services/websocket';
import { SessionManager } from '../services/sessionManager';
import { SendMessageRequest, SendAudioRequest, SendImageRequest } from '../types';

export const messageRouter = Router();

// Send text message
messageRouter.post('/', async (req: Request, res: Response) => {
  const telegramService: TelegramService = req.app.locals.telegramService;
  const wsHandler: WebSocketHandler = req.app.locals.wsHandler;
  const sessionManager: SessionManager = req.app.locals.sessionManager;
  
  const { sessionId, message }: SendMessageRequest = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId and message are required' });
  }

  const session = sessionManager.getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Set up callback for bot response
  telegramService.onMessage(sessionId, (content, metadata) => {
    wsHandler.sendMessage(sessionId, content, metadata);
  });

  // Send typing indicator
  wsHandler.sendTyping(sessionId, true);

  const success = await telegramService.sendMessage(sessionId, message);

  if (!success) {
    wsHandler.sendTyping(sessionId, false);
    return res.status(500).json({ error: 'Failed to send message' });
  }

  res.json({ success: true, messageId: Date.now().toString() });
});

// Send audio message
messageRouter.post('/audio', async (req: Request, res: Response) => {
  const telegramService: TelegramService = req.app.locals.telegramService;
  const wsHandler: WebSocketHandler = req.app.locals.wsHandler;
  const sessionManager: SessionManager = req.app.locals.sessionManager;
  
  const { sessionId, audio, mimeType }: SendAudioRequest = req.body;

  if (!sessionId || !audio) {
    return res.status(400).json({ error: 'sessionId and audio are required' });
  }

  const session = sessionManager.getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Set up callback for bot response
  telegramService.onMessage(sessionId, (content, metadata) => {
    wsHandler.sendMessage(sessionId, content, metadata);
  });

  // Send typing indicator
  wsHandler.sendTyping(sessionId, true);

  const success = await telegramService.sendAudio(sessionId, audio, mimeType || 'audio/ogg');

  if (!success) {
    wsHandler.sendTyping(sessionId, false);
    return res.status(500).json({ error: 'Failed to send audio' });
  }

  res.json({ success: true, messageId: Date.now().toString() });
});

// Send image message
messageRouter.post('/image', async (req: Request, res: Response) => {
  const telegramService: TelegramService = req.app.locals.telegramService;
  const wsHandler: WebSocketHandler = req.app.locals.wsHandler;
  const sessionManager: SessionManager = req.app.locals.sessionManager;
  
  const { sessionId, image, mimeType, caption }: SendImageRequest = req.body;

  if (!sessionId || !image) {
    return res.status(400).json({ error: 'sessionId and image are required' });
  }

  const session = sessionManager.getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Set up callback for bot response
  telegramService.onMessage(sessionId, (content, metadata) => {
    wsHandler.sendMessage(sessionId, content, metadata);
  });

  // Send typing indicator
  wsHandler.sendTyping(sessionId, true);

  const success = await telegramService.sendImage(sessionId, image, mimeType || 'image/jpeg', caption);

  if (!success) {
    wsHandler.sendTyping(sessionId, false);
    return res.status(500).json({ error: 'Failed to send image' });
  }

  res.json({ success: true, messageId: Date.now().toString() });
});
