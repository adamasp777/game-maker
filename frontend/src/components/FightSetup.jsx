import React, { useState, useEffect } from 'react';
import BackgroundSelector from './BackgroundSelector';

import { API_URL } from '../utils/api';

const WEAPONS = [
  { id: 'sword', name: '⚔️ Sword', desc: 'Classic blade' },
  { id: 'gun', name: '🔫 Gun', desc: 'Pew pew!' },
  { id: 'nunchucks', name: '🥋 Nunchucks', desc: 'Ninja style' },
  { id: 'stars', name: '⭐ Throwing Stars', desc: 'Silent & deadly' },
  { id: 'bat', name: '🏆 Baseball Bat', desc: 'Home run!' },
  { id: 'mace', name: '💥 Mace', desc: 'Medieval pain' }
];

function FightSetup({ onStartFight, onCancel, multiplayerGameData = null }) {
  const [player1Name, setPlayer1Name] = useState(multiplayerGameData?.players?.[0]?.username || '');
  const [player2Name, setPlayer2Name] = useState(multiplayerGameData?.players?.[1]?.username || '');
  const [player1Weapon, setPlayer1Weapon] = useState('sword');
  const [player2Weapon, setPlayer2Weapon] = useState('sword');
  const [player1Stats, setPlayer1Stats] = useState(null);
  const [player2Stats, setPlayer2Stats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [selectedBackground, setSelectedBackground] = useState(multiplayerGameData?.background || 'dungeon');
  const isMultiplayer = !!multiplayerGameData;

  // Fetch player stats when names change
  useEffect(() => {
    if (player1Name.trim().length >= 2) {
      fetch(`${API_URL}/api/scores/player/${encodeURIComponent(player1Name.trim())}`)
        .then(r => r.json())
        .then(setPlayer1Stats)
        .catch(() => setPlayer1Stats(null));
    } else {
      setPlayer1Stats(null);
    }
  }, [player1Name]);

  useEffect(() => {
    if (player2Name.trim().length >= 2) {
      fetch(`${API_URL}/api/scores/player/${encodeURIComponent(player2Name.trim())}`)
        .then(r => r.json())
        .then(setPlayer2Stats)
        .catch(() => setPlayer2Stats(null));
    } else {
      setPlayer2Stats(null);
    }
  }, [player2Name]);

  // Fetch recent matches
  useEffect(() => {
    fetch(`${API_URL}/api/scores/matches?limit=5`)
      .then(r => r.json())
      .then(setRecentMatches)
      .catch(() => setRecentMatches([]));
  }, []);

  const handleStart = () => {
    if (player1Name.trim() && player2Name.trim()) {
      onStartFight(player1Name.trim(), player2Name.trim(), player1Weapon, player2Weapon, selectedBackground);
    }
  };

  const canStart = player1Name.trim().length >= 2 && player2Name.trim().length >= 2;

  return (
    <div className="fight-setup">
      <div className="setup-header">
        <h2>⚔️ Battle Setup</h2>
        <button className="btn-close" onClick={onCancel}>×</button>
      </div>

      <div className="players-input">
        <div className="player-input-card">
          <h3>🗡️ Fighter 1</h3>
          <input
            type="text"
            placeholder="Enter name..."
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            maxLength={20}
            autoFocus
          />
          {player1Stats && (
            <div className="player-stats">
              {player1Stats.exists ? (
                <>
                  <span className="wins">🏆 {player1Stats.wins} wins</span>
                  <span className="losses">💀 {player1Stats.losses} losses</span>
                </>
              ) : (
                <span className="new-player">✨ New challenger!</span>
              )}
            </div>
          )}
          
          <div className="weapon-select">
            <label>Choose Weapon:</label>
            <div className="weapon-grid">
              {WEAPONS.map(w => (
                <button
                  key={w.id}
                  className={`weapon-btn ${player1Weapon === w.id ? 'selected' : ''}`}
                  onClick={() => setPlayer1Weapon(w.id)}
                  title={w.desc}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="vs-divider">VS</div>

        <div className="player-input-card">
          <h3>🗡️ Fighter 2</h3>
          <input
            type="text"
            placeholder="Enter name..."
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            maxLength={20}
          />
          {player2Stats && (
            <div className="player-stats">
              {player2Stats.exists ? (
                <>
                  <span className="wins">🏆 {player2Stats.wins} wins</span>
                  <span className="losses">💀 {player2Stats.losses} losses</span>
                </>
              ) : (
                <span className="new-player">✨ New challenger!</span>
              )}
            </div>
          )}
          
          <div className="weapon-select">
            <label>Choose Weapon:</label>
            <div className="weapon-grid">
              {WEAPONS.map(w => (
                <button
                  key={w.id}
                  className={`weapon-btn ${player2Weapon === w.id ? 'selected' : ''}`}
                  onClick={() => setPlayer2Weapon(w.id)}
                  title={w.desc}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BackgroundSelector 
        onSelect={setSelectedBackground}
        currentBackground={selectedBackground}
      />

      {recentMatches.length > 0 && (
        <div className="recent-matches">
          <h4>📜 Recent Battles</h4>
          {recentMatches.map((match, i) => (
            <div key={i} className="match-row">
              <span className="winner">🏆 {match.winner_name}</span>
              <span className="defeated">defeated</span>
              <span className="loser">💀 {match.loser_name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="setup-actions">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button 
          className="btn btn-fight" 
          onClick={handleStart}
          disabled={!canStart}
        >
          ⚔️ Start Battle!
        </button>
      </div>
    </div>
  );
}

export default FightSetup;
