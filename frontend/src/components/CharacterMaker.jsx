import React, { useState } from 'react';

const BODY_PARTS = [
  { key: 'head', label: 'Head' },
  { key: 'body', label: 'Body' },
  { key: 'leftArm', label: 'Left Arm' },
  { key: 'rightArm', label: 'Right Arm' },
  { key: 'leftLeg', label: 'Left Leg' },
  { key: 'rightLeg', label: 'Right Leg' }
];

const EYE_STYLES = [
  { value: 'normal', label: '👁️ Normal' },
  { value: 'sleepy', label: '😪 Sleepy' },
  { value: 'angry', label: '😠 Angry' },
  { value: 'wink', label: '😉 Wink' },
  { value: 'surprised', label: '😲 Surprised' },
  { value: 'heart', label: '😍 Heart' }
];

const MOUTH_STYLES = [
  { value: 'smile', label: '😊 Smile' },
  { value: 'frown', label: '😞 Frown' },
  { value: 'open', label: '😮 Open' },
  { value: 'tongue', label: '😛 Tongue' },
  { value: 'teeth', label: '😬 Teeth' },
  { value: 'smirk', label: '😏 Smirk' }
];

const MUSTACHE_STYLES = [
  { value: 'none', label: '❌ None' },
  { value: 'handlebar', label: '🥸 Handlebar' },
  { value: 'pencil', label: '✏️ Pencil' },
  { value: 'walrus', label: '🦭 Walrus' },
  { value: 'goatee', label: '🧔 Goatee' }
];

const HAIR_STYLES = [
  { value: 'none', label: '🥚 Bald' },
  { value: 'spiky', label: '⬆️ Spiky' },
  { value: 'curly', label: '🌀 Curly' },
  { value: 'mohawk', label: '🦔 Mohawk' },
  { value: 'long', label: '💇 Long' },
  { value: 'ponytail', label: '🎀 Ponytail' },
  { value: 'afro', label: '⭕ Afro' }
];

function CharacterMaker({ 
  character1, 
  character2, 
  activeCharacter, 
  setActiveCharacter, 
  onChange1, 
  onChange2, 
  onBack 
}) {
  const [tab, setTab] = useState('body'); // 'body' or 'face'
  const character = activeCharacter === 1 ? character1 : character2;
  const onChange = activeCharacter === 1 ? onChange1 : onChange2;
  
  const handleColorChange = (part, color) => {
    onChange({ ...character, [part]: color });
  };
  
  const handleStyleChange = (key, value) => {
    onChange({ ...character, [key]: value });
  };
  
  // Render face features based on character settings
  const renderEyes = (cx, scale = 1) => {
    const eyeColor = character.eyeColor || '#333';
    const style = character.eyeStyle || 'normal';
    const leftX = cx - 15 * scale;
    const rightX = cx + 15 * scale;
    const y = 45 * scale;
    const r = 5 * scale;
    
    switch (style) {
      case 'sleepy':
        return (
          <>
            <line x1={leftX - r} y1={y} x2={leftX + r} y2={y} stroke={eyeColor} strokeWidth="2" />
            <line x1={rightX - r} y1={y} x2={rightX + r} y2={y} stroke={eyeColor} strokeWidth="2" />
          </>
        );
      case 'angry':
        return (
          <>
            <circle cx={leftX} cy={y} r={r} fill={eyeColor} />
            <circle cx={rightX} cy={y} r={r} fill={eyeColor} />
            <line x1={leftX - r} y1={y - r - 2} x2={leftX + r} y2={y - r + 2} stroke={eyeColor} strokeWidth="2" />
            <line x1={rightX - r} y1={y - r + 2} x2={rightX + r} y2={y - r - 2} stroke={eyeColor} strokeWidth="2" />
          </>
        );
      case 'wink':
        return (
          <>
            <circle cx={leftX} cy={y} r={r} fill={eyeColor} />
            <path d={`M ${rightX - r} ${y} Q ${rightX} ${y + r} ${rightX + r} ${y}`} stroke={eyeColor} strokeWidth="2" fill="none" />
          </>
        );
      case 'surprised':
        return (
          <>
            <circle cx={leftX} cy={y} r={r * 1.5} fill="white" stroke={eyeColor} strokeWidth="2" />
            <circle cx={leftX} cy={y} r={r * 0.7} fill={eyeColor} />
            <circle cx={rightX} cy={y} r={r * 1.5} fill="white" stroke={eyeColor} strokeWidth="2" />
            <circle cx={rightX} cy={y} r={r * 0.7} fill={eyeColor} />
          </>
        );
      case 'heart':
        return (
          <>
            <text x={leftX} y={y + 4} textAnchor="middle" fontSize="12" fill="#FF1493">❤</text>
            <text x={rightX} y={y + 4} textAnchor="middle" fontSize="12" fill="#FF1493">❤</text>
          </>
        );
      default: // normal
        return (
          <>
            <circle cx={leftX} cy={y} r={r} fill={eyeColor} />
            <circle cx={rightX} cy={y} r={r} fill={eyeColor} />
          </>
        );
    }
  };
  
  const renderMouth = (cx, scale = 1) => {
    const style = character.mouthStyle || 'smile';
    const y = 60 * scale;
    const width = 15 * scale;
    
    switch (style) {
      case 'frown':
        return <path d={`M ${cx - width} ${y + 5} Q ${cx} ${y - 10} ${cx + width} ${y + 5}`} stroke="#333" strokeWidth="2" fill="none" />;
      case 'open':
        return <ellipse cx={cx} cy={y} rx={width * 0.6} ry={width * 0.5} fill="#333" />;
      case 'tongue':
        return (
          <>
            <path d={`M ${cx - width} ${y} Q ${cx} ${y + 15} ${cx + width} ${y}`} stroke="#333" strokeWidth="2" fill="none" />
            <ellipse cx={cx} cy={y + 8} rx={6} ry={4} fill="#FF6B6B" />
          </>
        );
      case 'teeth':
        return (
          <>
            <rect x={cx - width} y={y - 5} width={width * 2} height={12} rx="3" fill="white" stroke="#333" strokeWidth="2" />
            <line x1={cx - width / 2} y1={y - 5} x2={cx - width / 2} y2={y + 7} stroke="#333" strokeWidth="1" />
            <line x1={cx} y1={y - 5} x2={cx} y2={y + 7} stroke="#333" strokeWidth="1" />
            <line x1={cx + width / 2} y1={y - 5} x2={cx + width / 2} y2={y + 7} stroke="#333" strokeWidth="1" />
          </>
        );
      case 'smirk':
        return <path d={`M ${cx - width} ${y} Q ${cx - 5} ${y + 5} ${cx + width} ${y - 5}`} stroke="#333" strokeWidth="2" fill="none" />;
      default: // smile
        return <path d={`M ${cx - width} ${y} Q ${cx} ${y + 15} ${cx + width} ${y}`} stroke="#333" strokeWidth="2" fill="none" />;
    }
  };
  
  const renderMustache = (cx, scale = 1) => {
    const style = character.mustache || 'none';
    const y = 55 * scale;
    
    if (style === 'none') return null;
    
    const color = '#4A3728';
    
    switch (style) {
      case 'handlebar':
        return (
          <path 
            d={`M ${cx - 20} ${y + 5} Q ${cx - 25} ${y - 5} ${cx - 15} ${y} L ${cx} ${y + 2} L ${cx + 15} ${y} Q ${cx + 25} ${y - 5} ${cx + 20} ${y + 5}`}
            fill={color} 
          />
        );
      case 'pencil':
        return <rect x={cx - 18} y={y} width="36" height="4" rx="2" fill={color} />;
      case 'walrus':
        return (
          <path 
            d={`M ${cx - 25} ${y + 12} Q ${cx - 20} ${y - 5} ${cx} ${y} Q ${cx + 20} ${y - 5} ${cx + 25} ${y + 12}`}
            fill={color}
          />
        );
      case 'goatee':
        return (
          <>
            <rect x={cx - 18} y={y} width="36" height="3" rx="1" fill={color} />
            <ellipse cx={cx} cy={75} rx="8" ry="12" fill={color} />
          </>
        );
      default:
        return null;
    }
  };
  
  const renderHair = (cx, scale = 1) => {
    const style = character.hairStyle || 'none';
    const color = character.hairColor || '#4A3728';
    const headY = 50 * scale;
    const headR = 40 * scale;
    
    if (style === 'none') return null;
    
    switch (style) {
      case 'spiky':
        return (
          <g fill={color}>
            {[-25, -15, -5, 5, 15, 25].map((offset, i) => (
              <polygon 
                key={i}
                points={`${cx + offset - 5},${headY - headR + 10} ${cx + offset},${headY - headR - 15 - (i % 2) * 10} ${cx + offset + 5},${headY - headR + 10}`}
              />
            ))}
          </g>
        );
      case 'curly':
        return (
          <g fill={color}>
            {[-30, -20, -10, 0, 10, 20, 30].map((offset, i) => (
              <circle key={i} cx={cx + offset} cy={headY - headR + 5} r="10" />
            ))}
          </g>
        );
      case 'mohawk':
        return (
          <g fill={color}>
            {[-10, 0, 10].map((offset, i) => (
              <polygon 
                key={i}
                points={`${cx + offset - 6},${headY - headR + 5} ${cx + offset},${headY - headR - 35} ${cx + offset + 6},${headY - headR + 5}`}
              />
            ))}
          </g>
        );
      case 'long':
        return (
          <>
            <ellipse cx={cx - 35} cy={headY + 20} rx="12" ry="40" fill={color} />
            <ellipse cx={cx + 35} cy={headY + 20} rx="12" ry="40" fill={color} />
            <path d={`M ${cx - 40} ${headY - 20} Q ${cx} ${headY - headR - 10} ${cx + 40} ${headY - 20}`} fill={color} />
          </>
        );
      case 'ponytail':
        return (
          <>
            <path d={`M ${cx - 30} ${headY - 30} Q ${cx} ${headY - headR - 5} ${cx + 30} ${headY - 30}`} fill={color} />
            <ellipse cx={cx} cy={headY + 60} rx="8" ry="25" fill={color} />
            <circle cx={cx} cy={headY + 30} r="6" fill="#FF69B4" />
          </>
        );
      case 'afro':
        return <circle cx={cx} cy={headY - 15} r={headR + 15} fill={color} />;
      default:
        return null;
    }
  };

  return (
    <div className="character-maker">
      <div className="header">
        <button className="btn btn-back" onClick={onBack}>← Back</button>
        <h1>🎨 Character Maker</h1>
      </div>
      
      <div className="character-tabs">
        <button 
          className={`tab ${activeCharacter === 1 ? 'active' : ''}`}
          onClick={() => setActiveCharacter(1)}
        >
          👤 Player 1
        </button>
        <button 
          className={`tab ${activeCharacter === 2 ? 'active' : ''}`}
          onClick={() => setActiveCharacter(2)}
        >
          👥 Player 2
        </button>
      </div>
      
      <div className="maker-content">
        <div className="character-preview">
          <h4>Player {activeCharacter}</h4>
          <svg width="200" height="300" viewBox="0 0 200 300">
            {/* Hair (behind head) */}
            {character.hairStyle === 'afro' && renderHair(100)}
            
            {/* Head */}
            <circle cx="100" cy="50" r="40" fill={character.head} stroke="#333" strokeWidth="2" />
            
            {/* Hair (in front for most styles) */}
            {character.hairStyle !== 'afro' && renderHair(100)}
            
            {/* Eyes */}
            {renderEyes(100)}
            
            {/* Mustache */}
            {renderMustache(100)}
            
            {/* Mouth */}
            {renderMouth(100)}
            
            {/* Body */}
            <rect x="70" y="95" width="60" height="80" rx="10" fill={character.body} stroke="#333" strokeWidth="2" />
            
            {/* Left Arm */}
            <rect x="30" y="100" width="35" height="15" rx="5" fill={character.leftArm} stroke="#333" strokeWidth="2" />
            
            {/* Right Arm */}
            <rect x="135" y="100" width="35" height="15" rx="5" fill={character.rightArm} stroke="#333" strokeWidth="2" />
            
            {/* Left Leg */}
            <rect x="75" y="180" width="20" height="60" rx="5" fill={character.leftLeg} stroke="#333" strokeWidth="2" />
            
            {/* Right Leg */}
            <rect x="105" y="180" width="20" height="60" rx="5" fill={character.rightLeg} stroke="#333" strokeWidth="2" />
          </svg>
          
          {/* Side-by-side preview */}
          <div className="dual-preview">
            <div className="mini-char">
              <span>P1</span>
              <svg width="60" height="90" viewBox="0 0 200 300">
                <circle cx="100" cy="50" r="40" fill={character1.head} stroke="#333" strokeWidth="2" />
                <rect x="70" y="95" width="60" height="80" rx="10" fill={character1.body} stroke="#333" strokeWidth="2" />
              </svg>
            </div>
            <span className="vs">VS</span>
            <div className="mini-char">
              <span>P2</span>
              <svg width="60" height="90" viewBox="0 0 200 300">
                <circle cx="100" cy="50" r="40" fill={character2.head} stroke="#333" strokeWidth="2" />
                <rect x="70" y="95" width="60" height="80" rx="10" fill={character2.body} stroke="#333" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="color-pickers">
          <h3>Customize Player {activeCharacter}</h3>
          
          {/* Category tabs */}
          <div className="customize-tabs">
            <button className={`tab-small ${tab === 'body' ? 'active' : ''}`} onClick={() => setTab('body')}>
              👕 Body
            </button>
            <button className={`tab-small ${tab === 'face' ? 'active' : ''}`} onClick={() => setTab('face')}>
              😀 Face
            </button>
          </div>
          
          {tab === 'body' && (
            <>
              {BODY_PARTS.map(({ key, label }) => (
                <div key={key} className="color-picker-row">
                  <label>{label}</label>
                  <input
                    type="color"
                    value={character[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                  />
                  <span className="color-value">{character[key]}</span>
                </div>
              ))}
            </>
          )}
          
          {tab === 'face' && (
            <>
              {/* Eye Color */}
              <div className="color-picker-row">
                <label>👁️ Eye Color</label>
                <input
                  type="color"
                  value={character.eyeColor || '#333333'}
                  onChange={(e) => handleColorChange('eyeColor', e.target.value)}
                />
              </div>
              
              {/* Eye Style */}
              <div className="style-picker-row">
                <label>👀 Eye Style</label>
                <select 
                  value={character.eyeStyle || 'normal'}
                  onChange={(e) => handleStyleChange('eyeStyle', e.target.value)}
                >
                  {EYE_STYLES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Mouth Style */}
              <div className="style-picker-row">
                <label>👄 Mouth</label>
                <select 
                  value={character.mouthStyle || 'smile'}
                  onChange={(e) => handleStyleChange('mouthStyle', e.target.value)}
                >
                  {MOUTH_STYLES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Mustache */}
              <div className="style-picker-row">
                <label>🥸 Mustache</label>
                <select 
                  value={character.mustache || 'none'}
                  onChange={(e) => handleStyleChange('mustache', e.target.value)}
                >
                  {MUSTACHE_STYLES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Hair Style */}
              <div className="style-picker-row">
                <label>💇 Hair Style</label>
                <select 
                  value={character.hairStyle || 'none'}
                  onChange={(e) => handleStyleChange('hairStyle', e.target.value)}
                >
                  {HAIR_STYLES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Hair Color */}
              {character.hairStyle && character.hairStyle !== 'none' && (
                <div className="color-picker-row">
                  <label>🎨 Hair Color</label>
                  <input
                    type="color"
                    value={character.hairColor || '#4A3728'}
                    onChange={(e) => handleColorChange('hairColor', e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CharacterMaker;
