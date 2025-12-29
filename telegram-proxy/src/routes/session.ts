import { Router, Request, Response } from 'express';
import { SessionManager } from '../services/sessionManager';
import { CreateSessionResponse } from '../types';

export const sessionRouter = Router();

// Create new session
sessionRouter.post('/', (req: Request, res: Response) => {
  const sessionManager: SessionManager = req.app.locals.sessionManager;
  const { metadata } = req.body;

  const session = sessionManager.createSession(metadata || {});
  
  const response: CreateSessionResponse = {
    sessionId: session.id,
    wsUrl: `ws://${req.headers.host}/ws?sessionId=${session.id}`,
  };

  res.status(201).json(response);
});

// Get session info
sessionRouter.get('/:sessionId', (req: Request, res: Response) => {
  const sessionManager: SessionManager = req.app.locals.sessionManager;
  const { sessionId } = req.params;

  const session = sessionManager.getSession(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    id: session.id,
    createdAt: session.createdAt,
    lastActivity: session.lastActivity,
    metadata: session.metadata,
  });
});

// Get session messages
sessionRouter.get('/:sessionId/messages', (req: Request, res: Response) => {
  const sessionManager: SessionManager = req.app.locals.sessionManager;
  const { sessionId } = req.params;

  const session = sessionManager.getSession(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const messages = sessionManager.getMessages(sessionId);
  res.json({ messages });
});

// Delete session
sessionRouter.delete('/:sessionId', (req: Request, res: Response) => {
  const sessionManager: SessionManager = req.app.locals.sessionManager;
  const { sessionId } = req.params;

  const deleted = sessionManager.deleteSession(sessionId);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.status(204).send();
});
