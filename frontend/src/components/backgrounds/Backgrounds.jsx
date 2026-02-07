import React from 'react';

function DungeonBackground() {
  return (
    <div style={styles.dungeon}>
      <div style={styles.dungeonWall} />
      <div style={styles.torch} />
      <div style={styles.torch2} />
      <div style={styles.chains} />
    </div>
  );
}

function StadiumBackground() {
  return (
    <div style={styles.stadium}>
      <div style={styles.crowd} />
      <div style={styles.spotlights} />
      <div style={styles.banner}>FIGHT!</div>
    </div>
  );
}

function DojoBackground() {
  return (
    <div style={styles.dojo}>
      <div style={styles.tatami} />
      <div style={styles.bamboo} />
      <div style={styles.sakura} />
    </div>
  );
}

function SpaceBackground() {
  return (
    <div style={styles.space}>
      <div style={styles.stars} />
      <div style={styles.planet} />
      <div style={styles.nebula} />
    </div>
  );
}

function BeachBackground() {
  return (
    <div style={styles.beach}>
      <div style={styles.ocean} />
      <div style={styles.sand} />
      <div style={styles.palm} />
      <div style={styles.sun} />
    </div>
  );
}

function CastleBackground() {
  return (
    <div style={styles.castle}>
      <div style={styles.throne} />
      <div style={styles.pillars} />
      <div style={styles.banners} />
    </div>
  );
}

function ForestBackground() {
  return (
    <div style={styles.forest}>
      <div style={styles.trees} />
      <div style={styles.bushes} />
      <div style={styles.fireflies} />
    </div>
  );
}

export const backgrounds = {
  dungeon: {
    name: 'Dungeon',
    emoji: '🏰',
    component: DungeonBackground
  },
  stadium: {
    name: 'Stadium',
    emoji: '🏟️',
    component: StadiumBackground
  },
  dojo: {
    name: 'Dojo',
    emoji: '🥋',
    component: DojoBackground
  },
  space: {
    name: 'Space',
    emoji: '🚀',
    component: SpaceBackground
  },
  beach: {
    name: 'Beach',
    emoji: '🏖️',
    component: BeachBackground
  },
  castle: {
    name: 'Castle',
    emoji: '👑',
    component: CastleBackground
  },
  forest: {
    name: 'Forest',
    emoji: '🌲',
    component: ForestBackground
  }
};

const styles = {
  // Dungeon
  dungeon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #2a1a1a 0%, #1a0f0f 100%)',
    overflow: 'hidden',
  },
  dungeonWall: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 42px)',
    opacity: 0.5,
  },
  torch: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '30px',
    height: '50px',
    background: 'radial-gradient(circle, #ff6600 0%, #ff0000 50%, transparent 70%)',
    borderRadius: '50%',
    animation: 'flicker 2s infinite',
    filter: 'blur(8px)',
  },
  torch2: {
    position: 'absolute',
    top: '20%',
    right: '10%',
    width: '30px',
    height: '50px',
    background: 'radial-gradient(circle, #ff6600 0%, #ff0000 50%, transparent 70%)',
    borderRadius: '50%',
    animation: 'flicker 2.5s infinite',
    filter: 'blur(8px)',
  },
  chains: {
    position: 'absolute',
    top: '10%',
    left: '30%',
    width: '2px',
    height: '100px',
    background: 'repeating-linear-gradient(0deg, #555 0px, #555 10px, transparent 10px, transparent 15px)',
  },
  
  // Stadium
  stadium: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #1a472a 0%, #2d5a3d 50%, #4a7c59 100%)',
  },
  crowd: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    background: 'repeating-linear-gradient(90deg, #2a2a2a 0px, #2a2a2a 5px, #3a3a3a 5px, #3a3a3a 10px)',
    opacity: 0.6,
  },
  spotlights: {
    position: 'absolute',
    bottom: '70%',
    left: '20%',
    width: '60%',
    height: '100px',
    background: 'radial-gradient(ellipse, rgba(255,255,255,0.3) 0%, transparent 70%)',
  },
  banner: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '0 0 20px rgba(255,0,0,0.8), 0 0 40px rgba(255,0,0,0.5)',
    animation: 'pulse 2s infinite',
  },
  
  // Dojo
  dojo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #8b7355 0%, #6b5644 100%)',
  },
  tatami: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    background: 'repeating-linear-gradient(90deg, #d4b896 0px, #d4b896 50px, #c9ad86 50px, #c9ad86 100px)',
  },
  bamboo: {
    position: 'absolute',
    right: '10%',
    bottom: '20%',
    width: '40px',
    height: '200px',
    background: 'linear-gradient(180deg, #4a7c59 0%, #2d5a3d 100%)',
    borderRadius: '20px',
  },
  sakura: {
    position: 'absolute',
    top: '10%',
    right: '15%',
    width: '20px',
    height: '20px',
    background: '#ffb7c5',
    borderRadius: '50%',
    boxShadow: '30px 40px 0 #ffb7c5, 60px 20px 0 #ffc0cb, 90px 50px 0 #ffb7c5',
    animation: 'float 4s infinite ease-in-out',
  },
  
  // Space
  space: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)',
  },
  stars: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(2px 2px at 90% 60%, white, transparent), radial-gradient(1px 1px at 33% 90%, white, transparent)',
    backgroundSize: '200px 200px',
    animation: 'twinkle 5s infinite',
  },
  planet: {
    position: 'absolute',
    top: '20%',
    right: '15%',
    width: '100px',
    height: '100px',
    background: 'radial-gradient(circle at 30% 30%, #ff9966, #ff5533)',
    borderRadius: '50%',
    boxShadow: 'inset -20px -20px 50px rgba(0,0,0,0.5)',
  },
  nebula: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    width: '200px',
    height: '150px',
    background: 'radial-gradient(ellipse, rgba(138,43,226,0.3) 0%, transparent 70%)',
    filter: 'blur(30px)',
  },
  
  // Beach
  beach: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #F4E4C1 100%)',
  },
  ocean: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(180deg, #1e90ff 0%, #4682b4 100%)',
    animation: 'wave 3s infinite ease-in-out',
  },
  sand: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: '#F4E4C1',
  },
  palm: {
    position: 'absolute',
    bottom: '40%',
    left: '10%',
    width: '40px',
    height: '150px',
    background: 'linear-gradient(180deg, #8B4513 0%, #654321 100%)',
    borderRadius: '5px',
  },
  sun: {
    position: 'absolute',
    top: '10%',
    right: '15%',
    width: '80px',
    height: '80px',
    background: 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
    borderRadius: '50%',
    boxShadow: '0 0 50px rgba(255,215,0,0.8)',
  },
  
  // Castle
  castle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%)',
  },
  throne: {
    position: 'absolute',
    bottom: '30%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '120px',
    background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
    clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
  },
  pillars: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    width: '40px',
    height: '300px',
    background: 'repeating-linear-gradient(0deg, #666 0px, #666 20px, #555 20px, #555 40px)',
    boxShadow: '200px 0 0 #666, 400px 0 0 #666',
  },
  banners: {
    position: 'absolute',
    top: '10%',
    left: '15%',
    width: '60px',
    height: '100px',
    background: 'linear-gradient(180deg, #8B0000 0%, #DC143C 100%)',
    boxShadow: '150px 0 0 #000080',
  },
  
  // Forest
  forest: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #1a472a 0%, #0d2818 100%)',
  },
  trees: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 80px, rgba(34,139,34,0.3) 80px, rgba(34,139,34,0.3) 120px)',
  },
  bushes: {
    position: 'absolute',
    bottom: '10%',
    left: '20%',
    width: '80px',
    height: '40px',
    background: 'radial-gradient(ellipse, #228B22 0%, #006400 100%)',
    borderRadius: '50%',
    boxShadow: '100px 0 0 #228B22, 200px 10px 0 #2E8B57',
  },
  fireflies: {
    position: 'absolute',
    top: '30%',
    left: '40%',
    width: '5px',
    height: '5px',
    background: '#FFFF00',
    borderRadius: '50%',
    boxShadow: '50px 20px 0 #FFFF00, 100px 40px 0 #FFFF00, 150px 10px 0 #FFFF00',
    animation: 'glow 2s infinite',
  },
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes flicker {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    @keyframes pulse {
      0%, 100% { transform: translateX(-50%) scale(1); }
      50% { transform: translateX(-50%) scale(1.05); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    @keyframes twinkle {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes wave {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @keyframes glow {
      0%, 100% { opacity: 1; filter: blur(2px); }
      50% { opacity: 0.5; filter: blur(4px); }
    }
  `;
  if (!document.querySelector('style[data-backgrounds]')) {
    styleSheet.setAttribute('data-backgrounds', 'true');
    document.head.appendChild(styleSheet);
  }
}

export function BackgroundRenderer({ backgroundKey }) {
  const background = backgrounds[backgroundKey] || backgrounds.dungeon;
  const BackgroundComponent = background.component;
  return <BackgroundComponent />;
}

export default backgrounds;
