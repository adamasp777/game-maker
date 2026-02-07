import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import llmRoutes from './routes/llm.js';
import shareRoutes from './routes/share.js';
import scoresRoutes from './routes/scores.js';
import authRoutes from './routes/auth.js';
import roomsRoutes from './routes/rooms.js';
import { initializeSocket } from './socket.js';
import logger from './utils/logger.js';

const app = express();
const httpServer = createServer(app);
const PORT = 3001;

logger.info('Server', 'Starting Game Maker backend...');
logger.info('Server', 'Environment', {
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL || 'DEBUG',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
});

// Initialize Socket.IO
const io = initializeSocket(httpServer);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.debug('HTTP', `${req.method} ${req.path}`, {
    query: Object.keys(req.query).length ? req.query : undefined,
    ip: req.ip
  });
  
  // Log response
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.debug('HTTP', `${req.method} ${req.path} - ${res.statusCode}`, { duration: `${duration}ms` });
  });
  
  next();
});

app.use('/api/llm', llmRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);

app.get('/health', (req, res) => {
  logger.debug('Health', 'Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('HTTP', 'Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error' });
});

httpServer.listen(PORT, () => {
  logger.info('Server', `Backend server running on port ${PORT}`);
  logger.info('Server', 'Socket.IO server initialized');
});
