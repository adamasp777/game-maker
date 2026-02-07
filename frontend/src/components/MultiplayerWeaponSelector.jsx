import React, { useState, useEffect, useRef } from 'react';
import BackgroundSelector from './BackgroundSelector';
import { getSocket } from '../utils/socket';

const WEAPONS = [
  { id: 'sword', name: '⚔️ Sword', desc: 'Classic blade' },
  { id: 'gun', name: '🔫 Gun', desc: 'Pew pew!' },
  { id: 'nunchucks', name: '🥋 Nunchucks', desc: 'Ninja style' },
  { id: 'stars', name: '⭐ Throwing Stars', desc: 'Silent & deadly' },
  { id: 'bat', name: '🏆 Baseball Bat', desc: 'Home run!' },
  { id: 'mace', name: '💥 Mace', desc: 'Medieval pain' }
];

function MultiplayerWeaponSelector({ isHost, playerName, opponentName, onReady, roomId }) {
  const [selectedWeapon, setSelectedWeapon] = useState('sword');
  const [selectedBackground, setSelectedBackground] = useState('dungeon');
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [opponentWeapon, setOpponentWeapon] = useState(null);
  const configSentRef = useRef(false);

  const socket = getSocket();

  // Reset configSentRef when component mounts
  useEffect(() => {
    configSentRef.current = false;
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOpponentWeapon = ({ weapon }) => {
      setOpponentWeapon(weapon);
    };

    const handleOpponentReady = ({ ready }) => {
      setOpponentReady(ready);
    };

    const handleGameConfig = (config) => {
      // Non-host receives this and starts the game
      if (!isHost && !configSentRef.current) {
        configSentRef.current = true;
        onReady(config);
      }
    };

    socket.on('player:weapon-selected', handleOpponentWeapon);
    socket.on('player:ready', handleOpponentReady);
    socket.on('game:config', handleGameConfig);

    return () => {
      socket.off('player:weapon-selected', handleOpponentWeapon);
      socket.off('player:ready', handleOpponentReady);
      socket.off('game:config', handleGameConfig);
    };
  }, [socket, isHost, onReady]);

  const handleWeaponSelect = (weaponId) => {
    if (isReady) return; // Can't change weapon after ready

    setSelectedWeapon(weaponId);

    // Immediately emit weapon selection to opponent
    if (socket?.connected) {
      socket.emit('player:weapon-selected', {
        roomId,
        weapon: weaponId
      });
    }
  };

  const handleReady = () => {
    if (!selectedWeapon || !socket?.connected) return;

    setIsReady(true);

    // Emit ready status
    socket.emit('player:ready', {
      roomId,
      ready: true
    });

    // If both ready, emit full config (host only)
    if (isHost && opponentReady && !configSentRef.current) {
      configSentRef.current = true;
      const config = {
        roomId,
        player1Weapon: selectedWeapon,
        player2Weapon: opponentWeapon,
        background: selectedBackground,
        player1Name: playerName,
        player2Name: opponentName
      };
      socket.emit('game:config', config);
      onReady(config);
    }
  };


  // If opponent becomes ready after we're ready, start game (host only)
  useEffect(() => {
    if (isHost && isReady && opponentReady && opponentWeapon && !configSentRef.current) {
      configSentRef.current = true;
      const config = {
        roomId,
        player1Weapon: selectedWeapon,
        player2Weapon: opponentWeapon,
        background: selectedBackground,
        player1Name: playerName,
        player2Name: opponentName
      };
      socket.emit('game:config', config);
      onReady(config);
    }
  }, [isHost, isReady, opponentReady, opponentWeapon, selectedWeapon, selectedBackground, playerName, opponentName, roomId, socket, onReady]);

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>⚔️ Choose Your Weapon</h2>
        
        <div style={styles.info}>
          <div style={styles.playerInfo}>
            <span style={styles.label}>You: {playerName}</span>
            <span style={styles.status}>
              {isReady ? '✅ Ready' : '⏳ Selecting...'}
            </span>
          </div>
          <div style={styles.playerInfo}>
            <span style={styles.label}>Opponent: {opponentName}</span>
            <span style={styles.status}>
              {opponentReady ? '✅ Ready' : '⏳ Selecting...'}
            </span>
          </div>
        </div>

        <div style={styles.weaponGrid}>
          {WEAPONS.map(w => (
            <button
              key={w.id}
              style={{
                ...styles.weaponBtn,
                ...(selectedWeapon === w.id ? styles.weaponBtnSelected : {})
              }}
              onClick={() => handleWeaponSelect(w.id)}
              disabled={isReady}
              title={w.desc}
            >
              <div style={styles.weaponName}>{w.name}</div>
              <div style={styles.weaponDesc}>{w.desc}</div>
            </button>
          ))}
        </div>

        {isHost && (
          <div style={styles.backgroundSection}>
            <h3 style={styles.subtitle}>Choose Battle Arena</h3>
            <BackgroundSelector
              onSelect={setSelectedBackground}
              currentBackground={selectedBackground}
            />
          </div>
        )}

        <button
          style={{
            ...styles.readyBtn,
            ...(isReady ? styles.readyBtnDisabled : {})
          }}
          onClick={handleReady}
          disabled={isReady || !selectedWeapon}
        >
          {isReady ? '✅ Waiting for Opponent...' : '🎮 Ready to Fight!'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    overflowY: 'auto',
  },
  box: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    maxWidth: '800px',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  subtitle: {
    color: '#333',
    marginBottom: '15px',
  },
  info: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '30px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  playerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: '14px',
    color: '#666',
  },
  weaponGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  weaponBtn: {
    padding: '20px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  weaponBtnSelected: {
    border: '2px solid #667eea',
    background: '#f0f4ff',
    transform: 'scale(1.05)',
  },
  weaponName: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  weaponDesc: {
    fontSize: '12px',
    color: '#666',
  },
  backgroundSection: {
    marginBottom: '30px',
  },
  readyBtn: {
    width: '100%',
    padding: '20px',
    fontSize: '20px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  readyBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
};

export default MultiplayerWeaponSelector;
