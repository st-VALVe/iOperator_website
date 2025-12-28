import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { sessionRouter } from './routes/session';
import { messageRouter } from './routes/message';
import { TelegramService } from './services/telegram';
import { SessionManager } from './services/sessionManager';
import { WebSocketHandler } from './services/websocket';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Initialize services
const sessionManager = new SessionManager();
const telegramService = new TelegramService(sessionManager);
const wsHandler = new WebSocketHandler(wss, sessionManager);

// Make services available to routes
app.locals.sessionManager = sessionManager;
app.locals.telegramService = telegramService;
app.locals.wsHandler = wsHandler;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/session', sessionRouter);
app.use('/api/message', messageRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Telegram Proxy server running on port ${PORT}`);
  console.log(`📡 WebSocket available at ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
