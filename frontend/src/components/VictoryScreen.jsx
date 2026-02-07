import React, { useState, useEffect } from 'react';

function VictoryScreen({ 
  winnerName, 
  loserName, 
  winnerHealth, 
  isWinner,
  onClose,
  isMultiplayer = false,
  socket = null
}) {
  const [taunt, setTaunt] = useState('');
  const [receivedTaunt, setReceivedTaunt] = useState('');
  const [showRickroll, setShowRickroll] = useState(false);
  const [tauntSubmitted, setTauntSubmitted] = useState(false);

  useEffect(() => {
    if (isMultiplayer && socket) {
      socket.on('game:taunt', ({ taunt: incomingTaunt }) => {
        setReceivedTaunt(incomingTaunt);
        checkForRickroll(incomingTaunt);
      });

      return () => {
        socket.off('game:taunt');
      };
    }
  }, [socket, isMultiplayer]);

  const checkForRickroll = (text) => {
    if (text.toLowerCase().includes('rickroll')) {
      setTimeout(() => {
        setShowRickroll(true);
      }, 500);
    }
  };

  const handleSubmitTaunt = () => {
    if (!taunt.trim()) return;

    setTauntSubmitted(true);
    
    // Check for rickroll
    checkForRickroll(taunt);

    // Send taunt to opponent in multiplayer
    if (isMultiplayer && socket) {
      socket.emit('game:taunt', { taunt });
    }
  };

  const handleCloseRickroll = () => {
    setShowRickroll(false);
  };

  // Hide the actual taunt if it's the rickroll easter egg
  const sanitizeTaunt = (text) => {
    if (text.toLowerCase().includes('rickroll')) {
      return '🎵 ... 🎵';
    }
    return text;
  };
  
  const displayTaunt = isWinner ? sanitizeTaunt(taunt) : sanitizeTaunt(receivedTaunt);
  const showTauntInput = isWinner && !tauntSubmitted;
  const showDisplayTaunt = (isWinner && tauntSubmitted) || (!isWinner && receivedTaunt);

  return (
    <>
      <div style={styles.overlay}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>
              {isWinner ? '🎉 VICTORY! 🎉' : '💀 DEFEAT 💀'}
            </h1>
          </div>

          <div style={styles.content}>
            <div style={styles.statsBox}>
              <div style={styles.statRow}>
                <span style={styles.label}>Winner:</span>
                <span style={styles.winner}>{winnerName}</span>
              </div>
              <div style={styles.statRow}>
                <span style={styles.label}>Loser:</span>
                <span style={styles.loser}>{loserName}</span>
              </div>
              <div style={styles.statRow}>
                <span style={styles.label}>Final Health:</span>
                <span style={styles.health}>{winnerHealth}%</span>
              </div>
            </div>

            {showTauntInput && (
              <div style={styles.tauntSection}>
                <h3 style={styles.tauntTitle}>Victory Taunt</h3>
                <p style={styles.tauntSubtitle}>Say something to your opponent!</p>
                <input
                  type="text"
                  value={taunt}
                  onChange={(e) => setTaunt(e.target.value.slice(0, 100))}
                  placeholder="Enter your taunt..."
                  style={styles.tauntInput}
                  maxLength={100}
                  autoFocus
                />
                <div style={styles.charCount}>{taunt.length}/100</div>
                <button 
                  style={styles.submitButton}
                  onClick={handleSubmitTaunt}
                  disabled={!taunt.trim()}
                >
                  Submit Taunt
                </button>
              </div>
            )}

            {showDisplayTaunt && (
              <div style={styles.tauntDisplay}>
                <h3 style={styles.tauntDisplayTitle}>
                  {isWinner ? 'Your Taunt:' : 'Opponent\'s Taunt:'}
                </h3>
                <div style={styles.tauntMessage}>
                  "{displayTaunt}"
                </div>
              </div>
            )}

            {/* Only show close button after taunt is done in multiplayer */}
            {(!isMultiplayer || showDisplayTaunt) && (
              <button style={styles.closeButton} onClick={onClose}>
                {isMultiplayer ? 'Return to Lobby' : 'Close'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showRickroll && (
        <div style={styles.rickrollOverlay} onClick={handleCloseRickroll}>
          <div style={styles.rickrollContainer} onClick={(e) => e.stopPropagation()}>
            <button style={styles.rickrollClose} onClick={handleCloseRickroll}>
              ✕
            </button>
            <div style={styles.rickrollMessage}>
              <h2 style={styles.rickrollTitle}>🎵 You've been RICKROLLED! 🎵</h2>
              <p style={styles.rickrollSubtitle}>Never gonna give you up!</p>
            </div>
            <video
              style={styles.videoFrame}
              src="/rickroll.mp4"
              autoPlay
              controls
              loop
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '600px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    animation: 'slideIn 0.5s ease-out',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    color: 'white',
    fontSize: '48px',
    margin: 0,
    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  content: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
  },
  statsBox: {
    marginBottom: '20px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '18px',
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  winner: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  loser: {
    color: '#ef4444',
    fontSize: '20px',
  },
  health: {
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  tauntSection: {
    marginTop: '30px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  tauntTitle: {
    margin: '0 0 8px 0',
    color: '#333',
    fontSize: '24px',
  },
  tauntSubtitle: {
    margin: '0 0 15px 0',
    color: '#666',
    fontSize: '14px',
  },
  tauntInput: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  charCount: {
    textAlign: 'right',
    fontSize: '12px',
    color: '#999',
    marginTop: '5px',
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    marginTop: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  tauntDisplay: {
    marginTop: '30px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  tauntDisplayTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '18px',
  },
  tauntMessage: {
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    fontSize: '20px',
    fontStyle: 'italic',
    color: '#333',
    textAlign: 'center',
    border: '2px solid #667eea',
  },
  closeButton: {
    width: '100%',
    padding: '15px',
    marginTop: '30px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#666',
    background: '#e5e7eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  rickrollOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    animation: 'fadeIn 0.3s ease-out',
  },
  rickrollContainer: {
    position: 'relative',
    width: '90%',
    maxWidth: '800px',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  rickrollClose: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    width: '40px',
    height: '40px',
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    zIndex: 10,
  },
  rickrollMessage: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  rickrollTitle: {
    color: 'white',
    fontSize: '32px',
    margin: '0 0 10px 0',
    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
    animation: 'bounce 1s infinite',
  },
  rickrollSubtitle: {
    color: 'white',
    fontSize: '18px',
    margin: 0,
  },
  videoFrame: {
    width: '100%',
    height: '450px',
    borderRadius: '12px',
    border: '4px solid white',
  },
};

// Add keyframe animations via style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default VictoryScreen;
