import React, { useState } from 'react';
import GameCanvas from './GameCanvas';

function MainScreen({ 
  onCharacterMaker, 
  onJsonEditor, 
  onShare, 
  onFight, 
  onMultiplayer,
  onObjects,
  onScoreboard,
  onLogout,
  character1, 
  character2, 
  gameData,
  objects,
  user
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="main-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🎮 Game Maker</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: '#666' }}>👤 {user?.username}</span>
          <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '8px 16px' }}>
            Logout
          </button>
        </div>
      </div>
      
      <div className="button-row">
        <button className="btn btn-primary" onClick={onCharacterMaker}>
          🎨 Character Creator
        </button>
        <button className="btn btn-fight" onClick={onFight}>
          ⚔️ Local Fight
        </button>
        <button className="btn btn-multiplayer" onClick={onMultiplayer}>
          🌐 Multiplayer
        </button>
        <button className="btn btn-scores" onClick={onScoreboard}>
          🏆 Scoreboard
        </button>
      </div>
      
      <div className="preview-section">
        <h2>Preview</h2>
        <GameCanvas 
          character1={character1}
          character2={character2}
          gameData={gameData}
          objects={objects}
          isPlaying={isPlaying}
          onComplete={() => setIsPlaying(false)}
        />
        <button 
          className="btn btn-play" 
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? '⏹ Stop' : '▶ Play'}
        </button>
      </div>
    </div>
  );
}

export default MainScreen;
