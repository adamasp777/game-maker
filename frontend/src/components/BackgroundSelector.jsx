import React, { useState } from 'react';
import backgrounds from './backgrounds/Backgrounds';

function BackgroundSelector({ onSelect, currentBackground = 'dungeon' }) {
  const [selected, setSelected] = useState(currentBackground);

  const handleSelect = (key) => {
    setSelected(key);
    onSelect(key);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Choose Battle Arena</h3>
      <div style={styles.grid}>
        {Object.keys(backgrounds).map((key) => {
          const bg = backgrounds[key];
          const isSelected = selected === key;
          
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              style={{
                ...styles.card,
                ...(isSelected ? styles.cardSelected : {})
              }}
            >
              <div style={styles.emoji}>{bg.emoji}</div>
              <div style={styles.name}>{bg.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '15px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  card: {
    padding: '20px',
    background: 'white',
    border: '3px solid #ddd',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  cardSelected: {
    border: '3px solid #667eea',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%)',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  emoji: {
    fontSize: '36px',
  },
  name: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
};

export default BackgroundSelector;
