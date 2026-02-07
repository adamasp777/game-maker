import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import db from './utils/database.js';
import logger from './utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    logger.debug('Socket', 'Auth attempt', { socketId: socket.id, hasToken: !!token });
    
    if (!token) {
      logger.warn('Socket', 'Auth failed - no token', { socketId: socket.id });
      return next(new Error('Authentication required'));
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      logger.info('Socket', 'Auth success', { socketId: socket.id, userId: decoded.userId, username: decoded.username });
      next();
    } catch (error) {
      logger.error('Socket', 'Auth failed - invalid token', { socketId: socket.id, error: error.message });
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket', 'User connected', { socketId: socket.id, username: socket.username, userId: socket.userId });

    // Join a game room
    socket.on('room:join', (roomId) => {
      logger.debug('Socket', 'room:join event', { socketId: socket.id, roomId, username: socket.username });
      try {
        // Verify user is in this room
        const player = db.prepare(`
          SELECT rp.*, gr.room_code, gr.host_user_id
          FROM room_players rp
          JOIN game_rooms gr ON rp.room_id = gr.id
          WHERE rp.room_id = ? AND rp.user_id = ?
        `).get(roomId, socket.userId);
        
        if (!player) {
          logger.warn('Socket', 'room:join failed - not authorized', { socketId: socket.id, roomId, userId: socket.userId });
          socket.emit('error', { message: 'Not authorized for this room' });
          return;
        }
        
        socket.join(`room:${roomId}`);
        socket.roomId = roomId;
        socket.playerNumber = player.player_number;
        socket.isHost = player.host_user_id === socket.userId;
        
        // Get room players
        const players = db.prepare(`
          SELECT rp.player_number, u.username, u.id
          FROM room_players rp
          JOIN users u ON rp.user_id = u.id
          WHERE rp.room_id = ?
          ORDER BY rp.player_number
        `).all(roomId);
        
        // Notify room that player joined
        io.to(`room:${roomId}`).emit('room:player-joined', {
          userId: socket.userId,
          username: socket.username,
          playerNumber: socket.playerNumber,
          players
        });
        
        logger.info('Socket', 'User joined room', { 
          socketId: socket.id, 
          username: socket.username, 
          roomId, 
          playerNumber: socket.playerNumber,
          isHost: socket.isHost,
          totalPlayers: players.length 
        });
      } catch (error) {
        logger.error('Socket', 'room:join error', { socketId: socket.id, roomId, error: error.message, stack: error.stack });
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Player ready status
    socket.on('player:ready', (data) => {
      if (!socket.roomId) return;
      
      socket.to(`room:${socket.roomId}`).emit('player:ready', {
        userId: socket.userId,
        username: socket.username,
        playerNumber: socket.playerNumber,
        ready: data.ready
      });
    });

    // Player weapon selection (multiplayer)
    socket.on('player:weapon-selected', (data) => {
      const roomId = data.roomId || socket.roomId;

      if (!roomId) {
        logger.warn('Socket', 'No roomId for weapon selection', { socketId: socket.id, username: socket.username });
        return;
      }

      logger.debug('Socket', 'Weapon selected', { username: socket.username, weapon: data.weapon, roomId });

      // Broadcast weapon selection to other player
      socket.to(`room:${roomId}`).emit('player:weapon-selected', {
        weapon: data.weapon,
        userId: socket.userId,
        username: socket.username
      });
    });

    // Start game (host only)
    socket.on('game:start', (gameData) => {
      if (!socket.roomId || !socket.isHost) {
        socket.emit('error', { message: 'Only host can start game' });
        return;
      }

      try {
        // Update room status
        db.prepare('UPDATE game_rooms SET status = ? WHERE id = ?')
          .run('playing', socket.roomId);

        // Broadcast game start to all players in room
        io.to(`room:${socket.roomId}`).emit('game:start', gameData);

        logger.info('Socket', 'Game started', { roomId: socket.roomId, username: socket.username });
      } catch (error) {
        logger.error('Socket', 'Error starting game', { roomId: socket.roomId, error: error.message });
        socket.emit('error', { message: 'Failed to start game' });
      }
    });

    // Game configuration (host only) - weapons, background, etc.
    socket.on('game:config', (config) => {
      const roomId = config.roomId || socket.roomId;

      if (!roomId) {
        logger.warn('Socket', 'No roomId provided for game:config', { socketId: socket.id, username: socket.username });
        socket.emit('error', { message: 'Room ID not provided' });
        return;
      }

      // Verify user is host of this room
      try {
        const room = db.prepare('SELECT host_user_id FROM game_rooms WHERE id = ?').get(roomId);
        if (!room || room.host_user_id !== socket.userId) {
          logger.warn('Socket', 'Non-host tried to configure game', { roomId, userId: socket.userId });
          socket.emit('error', { message: 'Only host can configure game' });
          return;
        }
      } catch (error) {
        logger.error('Socket', 'Error verifying host', { roomId, error: error.message });
        socket.emit('error', { message: 'Failed to verify host' });
        return;
      }

      // Broadcast configuration to all players in room
      io.to(`room:${roomId}`).emit('game:config', config);

      logger.info('Socket', 'Game configured', { roomId, username: socket.username });
    });

    // Game action (attack, move, etc.)
    socket.on('game:action', (action) => {
      if (!socket.roomId) return;
      
      // Broadcast action to other players
      socket.to(`room:${socket.roomId}`).emit('game:action', {
        ...action,
        playerNumber: socket.playerNumber,
        username: socket.username
      });
    });

    // Game state update
    socket.on('game:state-update', (state) => {
      if (!socket.roomId) return;
      
      // Broadcast state update to other players
      socket.to(`room:${socket.roomId}`).emit('game:state-update', {
        ...state,
        playerNumber: socket.playerNumber
      });
    });

    // Game end
    socket.on('game:end', (result) => {
      if (!socket.roomId) return;

      try {
        // Update room status
        db.prepare('UPDATE game_rooms SET status = ? WHERE id = ?')
          .run('finished', socket.roomId);

        // Broadcast game end to all players
        io.to(`room:${socket.roomId}`).emit('game:end', result);

        logger.info('Socket', 'Game ended', { roomId: socket.roomId, username: socket.username });
      } catch (error) {
        logger.error('Socket', 'Error ending game', { roomId: socket.roomId, error: error.message });
      }
    });

    // Leave room
    socket.on('room:leave', () => {
      if (!socket.roomId) return;

      const roomId = socket.roomId;
      socket.leave(`room:${roomId}`);

      // Notify others that player left
      socket.to(`room:${roomId}`).emit('room:player-left', {
        userId: socket.userId,
        username: socket.username,
        playerNumber: socket.playerNumber
      });

      logger.info('Socket', 'User left room', { roomId, username: socket.username });

      socket.roomId = null;
      socket.playerNumber = null;
      socket.isHost = false;
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
      logger.info('Socket', 'User disconnected', { 
        socketId: socket.id, 
        username: socket.username, 
        userId: socket.userId,
        reason,
        wasInRoom: !!socket.roomId,
        roomId: socket.roomId
      });
      
      if (socket.roomId) {
        // Notify room that player disconnected
        socket.to(`room:${socket.roomId}`).emit('room:player-disconnected', {
          userId: socket.userId,
          username: socket.username,
          playerNumber: socket.playerNumber
        });
        logger.debug('Socket', 'Notified room of disconnect', { roomId: socket.roomId });
      }
    });

    // Victory taunt
    socket.on('game:taunt', ({ taunt }) => {
      if (!socket.roomId) return;
      
      // Broadcast taunt to opponent
      socket.to(`room:${socket.roomId}`).emit('game:taunt', {
        taunt,
        userId: socket.userId,
        username: socket.username
      });
    });

    // Chat message (optional feature)
    socket.on('chat:message', (message) => {
      if (!socket.roomId) return;
      
      io.to(`room:${socket.roomId}`).emit('chat:message', {
        userId: socket.userId,
        username: socket.username,
        message,
        timestamp: Date.now()
      });
    });
  });

  return io;
}
