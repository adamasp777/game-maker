import express from 'express';
import db from '../utils/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Generate random 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new game room
router.post('/create', verifyToken, (req, res) => {
  try {
    let roomCode;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Generate unique room code
    while (attempts < maxAttempts) {
      roomCode = generateRoomCode();
      const existing = db.prepare('SELECT id FROM game_rooms WHERE room_code = ?').get(roomCode);
      if (!existing) break;
      attempts++;
    }
    
    if (attempts === maxAttempts) {
      return res.status(500).json({ error: 'Failed to generate unique room code' });
    }
    
    // Create room
    const result = db.prepare(
      'INSERT INTO game_rooms (room_code, host_user_id, status) VALUES (?, ?, ?)'
    ).run(roomCode, req.userId, 'waiting');
    
    const roomId = result.lastInsertRowid;
    
    // Add host as first player
    db.prepare(
      'INSERT INTO room_players (room_id, user_id, player_number) VALUES (?, ?, ?)'
    ).run(roomId, req.userId, 1);
    
    res.json({
      success: true,
      room: {
        id: roomId,
        roomCode,
        hostUserId: req.userId,
        status: 'waiting'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room', message: error.message });
  }
});

// Join an existing room
router.post('/join', verifyToken, (req, res) => {
  try {
    const { roomCode } = req.body;
    
    if (!roomCode) {
      return res.status(400).json({ error: 'Room code is required' });
    }
    
    // Get room
    const room = db.prepare(
      'SELECT * FROM game_rooms WHERE room_code = ? AND status = ?'
    ).get(roomCode.toUpperCase(), 'waiting');
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found or already in progress' });
    }
    
    // Check if user is already in room
    const existingPlayer = db.prepare(
      'SELECT * FROM room_players WHERE room_id = ? AND user_id = ?'
    ).get(room.id, req.userId);
    
    if (existingPlayer) {
      return res.json({
        success: true,
        message: 'Already in room',
        room: {
          id: room.id,
          roomCode: room.room_code,
          hostUserId: room.host_user_id,
          status: room.status,
          playerNumber: existingPlayer.player_number
        }
      });
    }
    
    // Check room capacity
    const playerCount = db.prepare(
      'SELECT COUNT(*) as count FROM room_players WHERE room_id = ?'
    ).get(room.id).count;
    
    if (playerCount >= 2) {
      return res.status(400).json({ error: 'Room is full' });
    }
    
    // Add player to room
    db.prepare(
      'INSERT INTO room_players (room_id, user_id, player_number) VALUES (?, ?, ?)'
    ).run(room.id, req.userId, 2);
    
    res.json({
      success: true,
      room: {
        id: room.id,
        roomCode: room.room_code,
        hostUserId: room.host_user_id,
        status: room.status,
        playerNumber: 2
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join room', message: error.message });
  }
});

// Get room details
router.get('/:roomId', verifyToken, (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = db.prepare('SELECT * FROM game_rooms WHERE id = ?').get(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Get players in room
    const players = db.prepare(`
      SELECT rp.player_number, u.id, u.username
      FROM room_players rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = ?
      ORDER BY rp.player_number
    `).all(roomId);
    
    res.json({
      success: true,
      room: {
        id: room.id,
        roomCode: room.room_code,
        hostUserId: room.host_user_id,
        status: room.status,
        players
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get room', message: error.message });
  }
});

// Close/delete room (host only)
router.delete('/:roomId', verifyToken, (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = db.prepare('SELECT * FROM game_rooms WHERE id = ?').get(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    if (room.host_user_id !== req.userId) {
      return res.status(403).json({ error: 'Only the host can close the room' });
    }
    
    // Delete room (cascade will delete room_players)
    db.prepare('DELETE FROM game_rooms WHERE id = ?').run(roomId);
    
    res.json({ success: true, message: 'Room closed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to close room', message: error.message });
  }
});

// Update room status
router.patch('/:roomId/status', verifyToken, (req, res) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body;
    
    if (!status || !['waiting', 'playing', 'finished'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const room = db.prepare('SELECT * FROM game_rooms WHERE id = ?').get(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    if (room.host_user_id !== req.userId) {
      return res.status(403).json({ error: 'Only the host can update room status' });
    }
    
    db.prepare('UPDATE game_rooms SET status = ? WHERE id = ?').run(status, roomId);
    
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update room status', message: error.message });
  }
});

export default router;
