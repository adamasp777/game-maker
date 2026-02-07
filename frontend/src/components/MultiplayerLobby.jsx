import React, { useState, useEffect } from 'react';
import { getSocket } from '../utils/socket';

import { API_URL } from '../utils/api';

function MultiplayerLobby({ onStartGame, onBack, character1, character2, user }) {
  const [mode, setMode] = useState(null); // 'host' or 'join'
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const socket = getSocket();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!socket) {
      setError('Socket not initialized. Please log out and log back in.');
      return;
    }

    const handleConnect = () => {
      setConnectionStatus('connected');
      setError('');
    };
    const handleDisconnect = (reason) => {
      setConnectionStatus('disconnected');
      setError(`Disconnected: ${reason}`);
    };
    const handleConnectError = (err) => {
      setConnectionStatus('disconnected');
      setError(`Connection failed: ${err.message}`);
    };
    const handlePlayerJoined = ({ players: updatedPlayers }) => {
      setPlayers(updatedPlayers);
    };
    const handlePlayerReady = ({ ready }) => {
      setOpponentReady(ready);
    };
    const handleGameStart = (gameData) => {
      onStartGame({
        ...gameData,
        isHost: mode === 'host',
        roomId: room?.id
      });
    };
    const handlePlayerLeft = () => {
      setError('Opponent left the room');
      setOpponentReady(false);
    };
    const handlePlayerDisconnected = () => {
      setError('Opponent disconnected');
      setOpponentReady(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('room:player-joined', handlePlayerJoined);
    socket.on('player:ready', handlePlayerReady);
    socket.on('game:start', handleGameStart);
    socket.on('room:player-left', handlePlayerLeft);
    socket.on('room:player-disconnected', handlePlayerDisconnected);

    // Set initial connection status
    if (socket.connected) {
      setConnectionStatus('connected');
      setError('');
    } else {
      setConnectionStatus('disconnected');
      // Try to connect if not connected
      if (!socket.connecting) {
        socket.connect();
      }
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('room:player-joined', handlePlayerJoined);
      socket.off('player:ready', handlePlayerReady);
      socket.off('game:start', handleGameStart);
      socket.off('room:player-left', handlePlayerLeft);
      socket.off('room:player-disconnected', handlePlayerDisconnected);
    };
  }, [socket, room, mode, onStartGame]);

  const handleHostGame = async () => {
    // Check socket connection first
    if (!socket || !socket.connected) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/rooms/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create room');
        setLoading(false);
        return;
      }

      setRoom(data.room);
      setRoomCode(data.room.roomCode);
      setMode('host');
      setPlayers([{ id: user.id, username: user.username, player_number: 1 }]);

      // Join Socket.IO room
      socket.emit('room:join', data.room.id);
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Host error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!roomCode) {
      setError('Please enter a room code');
      return;
    }

    // Check socket connection first
    if (!socket || !socket.connected) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/rooms/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomCode: roomCode.toUpperCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to join room');
        setLoading(false);
        return;
      }

      setRoom(data.room);
      setMode('join');

      // Join Socket.IO room
      socket.emit('room:join', data.room.id);
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Join error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReady = () => {
    setIsReady(!isReady);
    socket.emit('player:ready', { ready: !isReady });
  };

  const handleStartGame = () => {
    if (mode !== 'host') return;
    if (players.length < 2) {
      setError('Waiting for another player to join');
      return;
    }
    if (!isReady || !opponentReady) {
      setError('Both players must be ready');
      return;
    }

    const gameData = {
      character1,
      character2,
      background: 'dungeon', // TODO: Add background selection
      players: players.map(p => ({ id: p.id, username: p.username, playerNumber: p.player_number }))
    };

    socket.emit('game:start', gameData);
  };

  if (!mode) {
    return (
      <div style={styles.container}>
        <div style={styles.box}>
          <h1 style={styles.title}>Multiplayer</h1>

          <div style={styles.statusBar}>
            <div style={{...styles.statusDot, backgroundColor: connectionStatus === 'connected' ? '#4ade80' : '#ef4444'}} />
            <span>{connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}</span>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.modeSelection}>
            <button
              style={{...styles.modeButton, opacity: connectionStatus !== 'connected' ? 0.6 : 1}}
              onClick={handleHostGame}
              disabled={loading || connectionStatus !== 'connected'}
            >
              {loading ? '⏳ Creating...' : '🏠 Host Game'}
            </button>
            <button
              style={{...styles.modeButton, opacity: connectionStatus !== 'connected' ? 0.6 : 1}}
              onClick={() => setMode('join-prompt')}
              disabled={connectionStatus !== 'connected'}
            >
              🚪 Join Game
            </button>
          </div>

          <button style={styles.backButton} onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'join-prompt') {
    return (
      <div style={styles.container}>
        <div style={styles.box}>
          <h1 style={styles.title}>Join Game</h1>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            style={styles.input}
            maxLength={6}
          />
          
          <button style={styles.joinButton} onClick={handleJoinGame} disabled={loading}>
            {loading ? 'Joining...' : 'Join'}
          </button>
          
          <button style={styles.backButton} onClick={() => setMode(null)}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>Game Lobby</h1>
        
        <div style={styles.statusBar}>
          <div style={{...styles.statusDot, backgroundColor: connectionStatus === 'connected' ? '#4ade80' : '#ef4444'}} />
          <span>{connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        {mode === 'host' && (
          <div style={styles.roomCode}>
            <div>Room Code:</div>
            <div style={styles.code}>{roomCode}</div>
            <div style={{fontSize: '14px', color: '#666'}}>Share this code with your opponent</div>
          </div>
        )}
        
        {error && <div style={styles.error}>{error}</div>}
        
        <div style={styles.playersList}>
          <h3>Players ({players.length}/2)</h3>
          {players.map((player, idx) => (
            <div key={player.id} style={styles.player}>
              <span>Player {player.player_number}: {player.username}</span>
              {player.id === user.id ? (
                <span style={{...styles.readyBadge, backgroundColor: isReady ? '#4ade80' : '#94a3b8'}}>
                  {isReady ? '✓ Ready' : 'Not Ready'}
                </span>
              ) : (
                <span style={{...styles.readyBadge, backgroundColor: opponentReady ? '#4ade80' : '#94a3b8'}}>
                  {opponentReady ? '✓ Ready' : 'Not Ready'}
                </span>
              )}
            </div>
          ))}
          {players.length < 2 && (
            <div style={styles.waiting}>Waiting for opponent...</div>
          )}
        </div>
        
        <div style={styles.actions}>
          <button
            style={{...styles.readyButton, backgroundColor: isReady ? '#ef4444' : '#4ade80'}}
            onClick={handleReady}
            disabled={players.length < 2}
          >
            {isReady ? 'Not Ready' : 'Ready'}
          </button>
          
          {mode === 'host' && (
            <button
              style={styles.startButton}
              onClick={handleStartGame}
              disabled={players.length < 2 || !isReady || !opponentReady}
            >
              Start Game
            </button>
          )}
        </div>
        
        <button style={styles.backButton} onClick={() => {
          socket.emit('room:leave');
          onBack();
        }}>
          ← Leave Lobby
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  box: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '500px',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  modeSelection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
  },
  modeButton: {
    padding: '20px',
    fontSize: '18px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    padding: '10px',
    background: '#f1f5f9',
    borderRadius: '6px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  roomCode: {
    textAlign: 'center',
    padding: '20px',
    background: '#f1f5f9',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  code: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#667eea',
    letterSpacing: '4px',
    margin: '10px 0',
  },
  playersList: {
    marginBottom: '20px',
  },
  player: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '6px',
    marginTop: '10px',
  },
  readyBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  waiting: {
    textAlign: 'center',
    padding: '20px',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  input: {
    width: '100%',
    padding: '15px',
    fontSize: '20px',
    textAlign: 'center',
    letterSpacing: '4px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    marginBottom: '15px',
    textTransform: 'uppercase',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  readyButton: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  startButton: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    background: '#667eea',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  joinButton: {
    width: '100%',
    padding: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '15px',
  },
  backButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    color: '#666',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  error: {
    background: '#fee',
    color: '#c33',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    textAlign: 'center',
  },
};

export default MultiplayerLobby;
