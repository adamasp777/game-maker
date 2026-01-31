import React, { useState } from 'react';

// Pre-made game objects with SVG paths
export const GAME_OBJECTS = {
  tree: {
    name: 'Tree',
    category: 'nature',
    width: 60,
    height: 100,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      // Trunk
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-10, 0, 20, 40);
      // Leaves
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(-35, 0);
      ctx.lineTo(35, 0);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -40);
      ctx.lineTo(-30, 10);
      ctx.lineTo(30, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  },
  rock: {
    name: 'Rock',
    category: 'nature',
    width: 50,
    height: 35,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#696969';
      ctx.beginPath();
      ctx.ellipse(0, 0, 25, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#808080';
      ctx.beginPath();
      ctx.ellipse(-8, -5, 10, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
  coin: {
    name: 'Coin',
    category: 'items',
    width: 30,
    height: 30,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#DAA520';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#DAA520';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 0);
      ctx.restore();
    }
  },
  platform: {
    name: 'Platform',
    category: 'terrain',
    width: 100,
    height: 20,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-50, -10, 100, 20);
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(-50, -10, 100, 5);
      ctx.restore();
    }
  },
  enemy: {
    name: 'Enemy',
    category: 'characters',
    width: 40,
    height: 40,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      // Body
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(-7, -5, 5, 0, Math.PI * 2);
      ctx.arc(7, -5, 5, 0, Math.PI * 2);
      ctx.fill();
      // Angry eyebrows
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, -12);
      ctx.lineTo(-3, -8);
      ctx.moveTo(12, -12);
      ctx.lineTo(3, -8);
      ctx.stroke();
      // Mouth
      ctx.beginPath();
      ctx.arc(0, 8, 8, 0, Math.PI);
      ctx.stroke();
      ctx.restore();
    }
  },
  heart: {
    name: 'Heart',
    category: 'items',
    width: 30,
    height: 28,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#FF1493';
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.bezierCurveTo(-15, -10, -15, -20, 0, -10);
      ctx.bezierCurveTo(15, -20, 15, -10, 0, 5);
      ctx.fill();
      ctx.restore();
    }
  },
  star: {
    name: 'Star',
    category: 'items',
    width: 30,
    height: 30,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i === 0 ? 15 : 15;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        const innerAngle = angle + (2 * Math.PI) / 10;
        ctx.lineTo(Math.cos(innerAngle) * 7, Math.sin(innerAngle) * 7);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  },
  cloud: {
    name: 'Cloud',
    category: 'nature',
    width: 80,
    height: 40,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-20, 0, 20, 0, Math.PI * 2);
      ctx.arc(10, -5, 25, 0, Math.PI * 2);
      ctx.arc(35, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
  bush: {
    name: 'Bush',
    category: 'nature',
    width: 50,
    height: 35,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(-12, 5, 15, 0, Math.PI * 2);
      ctx.arc(12, 5, 15, 0, Math.PI * 2);
      ctx.arc(0, -5, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
  crate: {
    name: 'Crate',
    category: 'items',
    width: 40,
    height: 40,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#DEB887';
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 2;
      ctx.fillRect(-20, -20, 40, 40);
      ctx.strokeRect(-20, -20, 40, 40);
      // Cross pattern
      ctx.beginPath();
      ctx.moveTo(-20, -20);
      ctx.lineTo(20, 20);
      ctx.moveTo(20, -20);
      ctx.lineTo(-20, 20);
      ctx.stroke();
      ctx.restore();
    }
  },
  spike: {
    name: 'Spike',
    category: 'hazards',
    width: 30,
    height: 25,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#4A4A4A';
      ctx.beginPath();
      ctx.moveTo(-15, 12);
      ctx.lineTo(-8, -12);
      ctx.lineTo(0, 12);
      ctx.lineTo(8, -12);
      ctx.lineTo(15, 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  },
  flag: {
    name: 'Flag',
    category: 'items',
    width: 40,
    height: 60,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      // Pole
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-3, -30, 6, 60);
      // Flag
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.moveTo(3, -30);
      ctx.lineTo(35, -20);
      ctx.lineTo(3, -10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  },
  potion: {
    name: 'Potion',
    category: 'items',
    width: 20,
    height: 30,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      // Bottle
      ctx.fillStyle = '#4169E1';
      ctx.beginPath();
      ctx.moveTo(-8, -5);
      ctx.lineTo(-8, 15);
      ctx.quadraticCurveTo(-8, 20, 0, 20);
      ctx.quadraticCurveTo(8, 20, 8, 15);
      ctx.lineTo(8, -5);
      ctx.closePath();
      ctx.fill();
      // Cork
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-5, -15, 10, 12);
      ctx.restore();
    }
  },
  sword: {
    name: 'Sword',
    category: 'weapons',
    width: 15,
    height: 50,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      // Blade
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(-5, 5);
      ctx.lineTo(5, 5);
      ctx.closePath();
      ctx.fill();
      // Guard
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-12, 5, 24, 5);
      // Handle
      ctx.fillRect(-3, 10, 6, 15);
      ctx.restore();
    }
  },
  shield: {
    name: 'Shield',
    category: 'weapons',
    width: 35,
    height: 40,
    render: (ctx, x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#4169E1';
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.quadraticCurveTo(-18, -15, -18, 5);
      ctx.quadraticCurveTo(-18, 20, 0, 25);
      ctx.quadraticCurveTo(18, 20, 18, 5);
      ctx.quadraticCurveTo(18, -15, 0, -20);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
};

function ObjectLibrary({ onAddObject, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = ['all', 'nature', 'items', 'terrain', 'characters', 'hazards', 'weapons'];
  
  const filteredObjects = Object.entries(GAME_OBJECTS).filter(([key, obj]) => 
    selectedCategory === 'all' || obj.category === selectedCategory
  );

  const handleAddObject = (objectType) => {
    onAddObject({
      type: objectType,
      x: 200,
      y: 200,
      scale: 1,
      id: Date.now()
    });
  };

  return (
    <div className="object-library">
      <div className="library-header">
        <h3>🎨 Object Library</h3>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>
      
      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="objects-grid">
        {filteredObjects.map(([key, obj]) => (
          <div
            key={key}
            className="object-item"
            onClick={() => handleAddObject(key)}
            title={`Add ${obj.name}`}
          >
            <canvas
              width="60"
              height="60"
              ref={canvas => {
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  ctx.clearRect(0, 0, 60, 60);
                  obj.render(ctx, 30, 35, 0.6);
                }
              }}
            />
            <span>{obj.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ObjectLibrary;
