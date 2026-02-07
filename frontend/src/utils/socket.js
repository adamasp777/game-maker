import { io } from 'socket.io-client';
import { API_URL } from './api';
import logger from './logger';

logger.info('Socket', 'Module loaded, API URL:', API_URL);

let socket = null;
let reconnectAttempts = 0;

export function initializeSocket(token) {
  if (socket && socket.connected) {
    logger.debug('Socket', 'Already connected, reusing socket');
    return socket;
  }

  logger.info('Socket', 'Initializing Socket.IO connection', { url: API_URL, hasToken: !!token });
  
  socket = io(API_URL, {
    auth: { token },
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    transports: ['websocket', 'polling'],
    withCredentials: false
  });

  socket.on('connect', () => {
    reconnectAttempts = 0;
    logger.info('Socket', 'Connected successfully', {
      socketId: socket.id,
      transport: socket.io.engine.transport.name
    });
  });

  socket.on('disconnect', (reason) => {
    logger.warn('Socket', 'Disconnected', { reason, socketId: socket.id });
  });

  socket.on('error', (error) => {
    logger.error('Socket', 'Socket error', { error: error.message || error });
  });

  socket.on('connect_error', (error) => {
    reconnectAttempts++;
    logger.error('Socket', 'Connection error', {
      message: error.message,
      attempt: reconnectAttempts,
      url: API_URL,
      description: error.description
    });
  });

  socket.io.on('reconnect', (attempt) => {
    logger.info('Socket', 'Reconnected', { attempt });
  });

  socket.io.on('reconnect_attempt', (attempt) => {
    logger.debug('Socket', 'Reconnection attempt', { attempt });
  });

  socket.io.on('reconnect_failed', () => {
    logger.error('Socket', 'Reconnection failed after all attempts');
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function connectSocket() {
  if (socket && !socket.connected) {
    console.log('[Socket] Attempting to connect Socket.IO...');
    socket.connect();
  } else if (!socket) {
    console.error('[Socket] Cannot connect - socket not initialized');
  }
}

export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}

export function updateSocketToken(token) {
  if (socket) {
    socket.auth = { token };
    if (socket.connected) {
      socket.disconnect();
      socket.connect();
    }
  }
}
