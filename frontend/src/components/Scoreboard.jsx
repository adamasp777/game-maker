import React, { useState, useEffect } from 'react';

import { API_URL } from '../utils/api';

function Scoreboard({ onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leadRes, matchRes] = await Promise.all([
          fetch(`${API_URL}/api/scores/leaderboard`),
          fetch(`${API_URL}/api/scores/matches?limit=15`)
        ]);
        
        setLeaderboard(await leadRes.json());
        setRecentMatches(await matchRes.json());
      } catch (error) {
        console.error('Failed to fetch scores:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  return (
    <div className="scoreboard">
      <div className="scoreboard-header">
        <h2>🏆 Battle Records</h2>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>

      <div className="scoreboard-tabs">
        <button 
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 Match History
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {activeTab === 'leaderboard' && (
            <div className="leaderboard">
              {leaderboard.length === 0 ? (
                <div className="empty-state">
                  <p>No battles recorded yet!</p>
                  <p>Start a fight to see the leaderboard.</p>
                </div>
              ) : (
                <div className="leaderboard-list">
                  {leaderboard.map((player, i) => (
                    <div key={player.name} className={`leaderboard-row rank-${i + 1}`}>
                      <span className="rank">{getMedal(i)}</span>
                      <span className="name">{player.name}</span>
                      <span className="stats">
                        <span className="wins">{player.wins}W</span>
                        <span className="separator">-</span>
                        <span className="losses">{player.losses}L</span>
                      </span>
                      <span className="winrate">{player.win_rate}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="match-history">
              {recentMatches.length === 0 ? (
                <div className="empty-state">
                  <p>No matches recorded yet!</p>
                </div>
              ) : (
                <div className="match-list">
                  {recentMatches.map((match, i) => (
                    <div key={i} className="match-entry">
                      <div className="match-result">
                        <span className="winner">🏆 {match.winner_name}</span>
                        <span className="vs">defeated</span>
                        <span className="loser">💀 {match.loser_name}</span>
                      </div>
                      <div className="match-details">
                        <span className="health">❤️ {match.winner_health} HP left</span>
                        <span className="date">{formatDate(match.played_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Scoreboard;
