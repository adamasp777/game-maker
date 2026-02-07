import React from 'react';

function WaitingScreen({ message = 'Waiting for host to configure game...' }) {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.spinner}>⏳</div>
        <h2 style={styles.message}>{message}</h2>
        <div style={styles.dots}>
          <span style={styles.dot}>.</span>
          <span style={styles.dot}>.</span>
          <span style={styles.dot}>.</span>
        </div>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    zIndex: 1000,
  },
  box: {
    background: 'white',
    padding: '60px 40px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    textAlign: 'center',
    maxWidth: '400px',
  },
  spinner: {
    fontSize: '64px',
    marginBottom: '20px',
    animation: 'spin 2s linear infinite',
  },
  message: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '20px',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  dot: {
    fontSize: '32px',
    color: '#667eea',
    animation: 'bounce 1.4s ease-in-out infinite',
  },
};

// Add CSS animations
if (typeof document !== 'undefined' && !document.querySelector('style[data-waiting-screen]')) {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('data-waiting-screen', 'true');
  styleSheet.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default WaitingScreen;
