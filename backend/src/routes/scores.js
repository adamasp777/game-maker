import express from 'express';
import db from '../utils/database.js';

const router = express.Router();

// Get leaderboard (all players sorted by wins)
router.get('/leaderboard', (req, res) => {
  try {
    const players = db.prepare(`
      SELECT name, wins, losses, 
             CASE WHEN (wins + losses) > 0 
                  THEN ROUND(wins * 100.0 / (wins + losses), 1) 
                  ELSE 0 
             END as win_rate
      FROM players 
      ORDER BY wins DESC, losses ASC
      LIMIT 20
    `).all();
    
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard', message: error.message });
  }
});

// Get recent matches
router.get('/matches', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const matches = db.prepare(`
      SELECT winner_name, loser_name, winner_health, played_at
      FROM matches 
      ORDER BY played_at DESC
      LIMIT ?
    `).all(limit);
    
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches', message: error.message });
  }
});

// Get player stats
router.get('/player/:name', (req, res) => {
  try {
    const { name } = req.params;
    const player = db.prepare('SELECT * FROM players WHERE name = ?').get(name);
    
    if (!player) {
      return res.json({ name, wins: 0, losses: 0, exists: false });
    }
    
    // Get recent matches for this player
    const recentMatches = db.prepare(`
      SELECT winner_name, loser_name, winner_health, played_at
      FROM matches 
      WHERE winner_name = ? OR loser_name = ?
      ORDER BY played_at DESC
      LIMIT 5
    `).all(name, name);
    
    res.json({ ...player, exists: true, recentMatches });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player', message: error.message });
  }
});

// Record a match result
router.post('/match', (req, res) => {
  try {
    const { winnerName, loserName, winnerHealth } = req.body;
    
    if (!winnerName || !loserName) {
      return res.status(400).json({ error: 'Winner and loser names are required' });
    }
    
    // Upsert winner
    db.prepare(`
      INSERT INTO players (name, wins, losses) VALUES (?, 1, 0)
      ON CONFLICT(name) DO UPDATE SET wins = wins + 1
    `).run(winnerName);
    
    // Upsert loser
    db.prepare(`
      INSERT INTO players (name, wins, losses) VALUES (?, 0, 1)
      ON CONFLICT(name) DO UPDATE SET losses = losses + 1
    `).run(loserName);
    
    // Record match
    db.prepare(`
      INSERT INTO matches (winner_name, loser_name, winner_health)
      VALUES (?, ?, ?)
    `).run(winnerName, loserName, winnerHealth || 0);
    
    // Get updated stats
    const winner = db.prepare('SELECT * FROM players WHERE name = ?').get(winnerName);
    const loser = db.prepare('SELECT * FROM players WHERE name = ?').get(loserName);
    
    res.json({ 
      success: true, 
      message: `${winnerName} defeated ${loserName}!`,
      winner,
      loser
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record match', message: error.message });
  }
});

export default router;
