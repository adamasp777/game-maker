import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket';
import { BackgroundRenderer } from './backgrounds/Backgrounds';
import VictoryScreen from './VictoryScreen';
import { API_URL } from '../utils/api';

function FightModule({ 
  character1, 
  character2, 
  player1Name = 'Player 1', 
  player2Name = 'Player 2', 
  player1Weapon = 'sword', 
  player2Weapon = 'sword', 
  background = 'dungeon',
  isMultiplayer = false,
  multiplayerData = null,
  onClose, 
  onFightEnd 
}) {
  
  // Weapon drawing functions
  const drawWeapon = (ctx, weapon, flipped) => {
    ctx.save();
    ctx.translate(70, -25);
    ctx.rotate(flipped ? -0.3 : 0.3);
    
    switch (weapon) {
      case 'sword':
        // Sword blade
        ctx.fillStyle = '#C0C0C0';
        ctx.strokeStyle = '#708090';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-8, -70);
        ctx.lineTo(0, -80);
        ctx.lineTo(8, -70);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.stroke();
        // Guard
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, 5, 15, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Handle
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.roundRect(-4, 8, 8, 25, 3);
        ctx.fill();
        break;
        
      case 'gun':
        // Gun body
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.roundRect(-5, -40, 10, 50, 3);
        ctx.fill();
        // Barrel
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.roundRect(-3, -70, 6, 30, 2);
        ctx.fill();
        // Handle
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.roundRect(-6, 10, 12, 25, 3);
        ctx.fill();
        // Trigger
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 5, 5, 0, Math.PI);
        ctx.stroke();
        break;
        
      case 'nunchucks':
        // Handle 1
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.roundRect(-4, -60, 8, 35, 3);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.stroke();
        // Handle 2
        ctx.beginPath();
        ctx.roundRect(-4, 0, 8, 35, 3);
        ctx.fill();
        ctx.stroke();
        // Chain
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(-10, -15);
        ctx.lineTo(0, -5);
        ctx.stroke();
        break;
        
      case 'stars':
        // Multiple throwing stars
        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.translate(i * 5 - 5, -40 - i * 20);
          ctx.fillStyle = '#C0C0C0';
          ctx.beginPath();
          for (let j = 0; j < 6; j++) {
            const angle = (j * Math.PI / 3) - Math.PI / 2;
            const r = j % 2 === 0 ? 12 : 5;
            if (j === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#708090';
          ctx.stroke();
          ctx.restore();
        }
        break;
        
      case 'bat':
        // Bat handle
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.roundRect(-4, 0, 8, 40, 3);
        ctx.fill();
        // Bat barrel
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-12, -50);
        ctx.quadraticCurveTo(-15, -60, -10, -70);
        ctx.lineTo(10, -70);
        ctx.quadraticCurveTo(15, -60, 12, -50);
        ctx.lineTo(6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.stroke();
        // Grip lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(-4, 5 + i * 8);
          ctx.lineTo(4, 5 + i * 8);
          ctx.stroke();
        }
        break;
        
      case 'mace':
        // Handle
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.roundRect(-4, -20, 8, 55, 3);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.stroke();
        // Mace head
        ctx.fillStyle = '#708090';
        ctx.beginPath();
        ctx.arc(0, -40, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Spikes
        ctx.fillStyle = '#555';
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 15 + 0, Math.sin(angle) * 15 - 40);
          ctx.lineTo(Math.cos(angle) * 28 + 0, Math.sin(angle) * 28 - 40);
          ctx.lineTo(Math.cos(angle + 0.2) * 15 + 0, Math.sin(angle + 0.2) * 15 - 40);
          ctx.fill();
        }
        break;
        
      default:
        // Default sword
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-8, -70);
        ctx.lineTo(0, -80);
        ctx.lineTo(8, -70);
        ctx.lineTo(0, 0);
        ctx.fill();
    }
    
    ctx.restore();
  };
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState({
    player1: { health: 100, maxHealth: 100, defending: false, x: 80 },
    player2: { health: 100, maxHealth: 100, defending: false, x: 320 },
    turn: 1, // 1 or 2
    message: `${player1Name}'s turn!`,
    isAnimating: false,
    winner: null,
    deathAnimation: 0, // 0-100 for animation progress
    flowerGrowth: 0, // 0-100 for flower growing
    matchRecorded: false
  });
  
  // Determine local player number for multiplayer
  const localPlayerNumber = isMultiplayer && multiplayerData ? 
    (multiplayerData.isHost ? 1 : 2) : null;
  const isLocalPlayerTurn = !isMultiplayer || localPlayerNumber === gameState.turn;
  const [battleLog, setBattleLog] = useState([]);
  const [animationFrame, setAnimationFrame] = useState(0);
  
  const getPlayerName = (playerNum) => playerNum === 1 ? player1Name : player2Name;

  // Animation loop for winner effects (halo, sparkles)
  useEffect(() => {
    if (gameState.winner && gameState.deathAnimation >= 50) {
      const animId = requestAnimationFrame(() => {
        setAnimationFrame(f => f + 1);
      });
      return () => cancelAnimationFrame(animId);
    }
  }, [gameState.winner, gameState.deathAnimation, animationFrame]);
  
  // Listen for multiplayer game actions
  useEffect(() => {
    if (!isMultiplayer) return;
    
    const socket = getSocket();
    if (!socket) return;
    
    const handleGameAction = (action) => {
      console.log('Received game action:', action);
      
      // Apply action from other player
      if (action.type === 'attack') {
        animateAttack(action.attacker, action.defender);
      } else if (action.type === 'defend') {
        const currentPlayer = action.defender === 1 ? 'player1' : 'player2';
        setGameState(prev => ({
          ...prev,
          [currentPlayer]: { ...prev[currentPlayer], defending: true },
          turn: action.nextTurn,
          message: `${getPlayerName(action.nextTurn)}'s turn!`
        }));
        addLog(`${getPlayerName(action.defender)} is defending!`);
      } else if (action.type === 'special') {
        handleSpecialAction(action);
      }
    };
    
    socket.on('game:action', handleGameAction);
    
    return () => {
      socket.off('game:action', handleGameAction);
    };
  }, [isMultiplayer, gameState]);

  const addLog = (msg) => {
    setBattleLog(prev => [...prev.slice(-4), msg]);
  };

  const calculateDamage = (isDefending) => {
    const baseDamage = Math.floor(Math.random() * 15) + 10; // 10-25 damage
    if (isDefending) {
      return Math.floor(baseDamage * 0.5); // 50% reduction when defending
    }
    return baseDamage;
  };

  const animateAttack = async (attacker, defender) => {
    const attackerKey = attacker === 1 ? 'player1' : 'player2';
    const defenderKey = attacker === 1 ? 'player2' : 'player1';
    
    setGameState(prev => ({ ...prev, isAnimating: true }));
    
    // Move attacker forward
    const originalX = gameState[attackerKey].x;
    const targetX = attacker === 1 ? 150 : 250;
    
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 30));
      setGameState(prev => ({
        ...prev,
        [attackerKey]: { ...prev[attackerKey], x: originalX + ((targetX - originalX) * (i / 10)) }
      }));
    }
    
    // Calculate and apply damage
    const damage = calculateDamage(gameState[defenderKey].defending);
    const newHealth = Math.max(0, gameState[defenderKey].health - damage);
    
    setGameState(prev => ({
      ...prev,
      [defenderKey]: { ...prev[defenderKey], health: newHealth, defending: false }
    }));
    
    addLog(`${getPlayerName(attacker)} attacks for ${damage} damage!`);
    
    // Move attacker back
    for (let i = 10; i >= 0; i--) {
      await new Promise(r => setTimeout(r, 30));
      setGameState(prev => ({
        ...prev,
        [attackerKey]: { ...prev[attackerKey], x: originalX + ((targetX - originalX) * (i / 10)) }
      }));
    }
    
    // Check for winner
    if (newHealth <= 0) {
      const winnerName = getPlayerName(attacker);
      const loserName = getPlayerName(attacker === 1 ? 2 : 1);
      const winnerHealth = gameState[attacker === 1 ? 'player1' : 'player2'].health;
      
      setGameState(prev => ({
        ...prev,
        isAnimating: true,
        winner: attacker,
        message: `${winnerName} wins!`
      }));
      addLog(`${winnerName} wins the battle!`);
      
      // Record match to database
      fetch(`${API_URL}/api/scores/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerName, loserName, winnerHealth })
      }).catch(err => console.error('Failed to record match:', err));
      // Start death animation
      let animProgress = 0;
      const deathInterval = setInterval(() => {
        animProgress += 5;
        setGameState(prev => ({ ...prev, deathAnimation: animProgress }));
        if (animProgress >= 100) {
          clearInterval(deathInterval);
          // Start flower growth
          let flowerProgress = 0;
          const flowerInterval = setInterval(() => {
            flowerProgress += 3;
            setGameState(prev => ({ ...prev, flowerGrowth: flowerProgress, isAnimating: false }));
            if (flowerProgress >= 100) {
              clearInterval(flowerInterval);
            }
          }, 50);
        }
      }, 40);
      if (onFightEnd) onFightEnd(attacker);
      return;
    }
    
    // Switch turns
    const nextTurn = attacker === 1 ? 2 : 1;
    setGameState(prev => ({
      ...prev,
      isAnimating: false,
      turn: nextTurn,
      message: `Player ${nextTurn}'s turn!`
    }));
  };

  const handleAttack = () => {
    if (gameState.isAnimating || gameState.winner) return;
    if (isMultiplayer && !isLocalPlayerTurn) return;
    
    const attacker = gameState.turn;
    const defender = attacker === 1 ? 2 : 1;
    
    // Emit to other player in multiplayer
    if (isMultiplayer) {
      const socket = getSocket();
      socket.emit('game:action', {
        type: 'attack',
        attacker,
        defender
      });
    }
    
    animateAttack(attacker, defender);
  };

  const handleDefend = () => {
    if (gameState.isAnimating || gameState.winner) return;
    if (isMultiplayer && !isLocalPlayerTurn) return;
    
    const defender = gameState.turn;
    const nextTurn = defender === 1 ? 2 : 1;
    const currentPlayer = defender === 1 ? 'player1' : 'player2';
    
    // Emit to other player in multiplayer
    if (isMultiplayer) {
      const socket = getSocket();
      socket.emit('game:action', {
        type: 'defend',
        defender,
        nextTurn
      });
    }
    
    setGameState(prev => ({
      ...prev,
      [currentPlayer]: { ...prev[currentPlayer], defending: true },
      turn: nextTurn,
      message: `${getPlayerName(nextTurn)}'s turn!`
    }));
    addLog(`${getPlayerName(defender)} is defending!`);
  };

  const handleSpecialAction = (action) => {
    const { attacker, defender, hit, damage, newHealth, nextTurn } = action;
    const defenderKey = defender === 1 ? 'player1' : 'player2';
    
    if (hit) {
      setGameState(prev => ({
        ...prev,
        [defenderKey]: { ...prev[defenderKey], health: newHealth, defending: false },
        turn: nextTurn,
        message: `${getPlayerName(nextTurn)}'s turn!`
      }));
      addLog(`${getPlayerName(attacker)} special attack hits for ${damage}!`);
      
      if (newHealth <= 0) {
        const winnerName = getPlayerName(attacker);
        const loserName = getPlayerName(attacker === 1 ? 2 : 1);
        const winnerHealth = gameState[attacker === 1 ? 'player1' : 'player2'].health;
        
        setGameState(prev => ({
          ...prev,
          isAnimating: true,
          winner: attacker,
          message: `${winnerName} wins!`
        }));
        
        // Record match to database
        fetch(`${API_URL}/api/scores/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winnerName, loserName, winnerHealth })
        }).catch(err => console.error('Failed to record match:', err));
        
        // Start death animation
        let animProgress = 0;
        const deathInterval = setInterval(() => {
          animProgress += 5;
          setGameState(prev => ({ ...prev, deathAnimation: animProgress }));
          if (animProgress >= 100) {
            clearInterval(deathInterval);
            let flowerProgress = 0;
            const flowerInterval = setInterval(() => {
              flowerProgress += 3;
              setGameState(prev => ({ ...prev, flowerGrowth: flowerProgress, isAnimating: false }));
              if (flowerProgress >= 100) {
                clearInterval(flowerInterval);
              }
            }, 50);
          }
        }, 40);
        if (onFightEnd) onFightEnd(attacker);
      }
    } else {
      addLog(`${getPlayerName(attacker)}'s special attack missed!`);
      setGameState(prev => ({
        ...prev,
        turn: nextTurn,
        message: `${getPlayerName(nextTurn)}'s turn!`
      }));
    }
  };

  const handleSpecial = () => {
    if (gameState.isAnimating || gameState.winner) return;
    if (isMultiplayer && !isLocalPlayerTurn) return;
    
    const attacker = gameState.turn;
    const defender = attacker === 1 ? 2 : 1;
    const defenderKey = attacker === 1 ? 'player2' : 'player1';
    
    // Special attack: 60% chance to hit, 40% chance to miss
    const hit = Math.random() > 0.4;
    const damage = hit ? Math.floor(Math.random() * 20) + 20 : 0; // 20-40 damage if hit
    const newHealth = hit ? Math.max(0, gameState[defenderKey].health - damage) : gameState[defenderKey].health;
    const nextTurn = attacker === 1 ? 2 : 1;
    
    // Emit to other player in multiplayer
    if (isMultiplayer) {
      const socket = getSocket();
      socket.emit('game:action', {
        type: 'special',
        attacker,
        defender,
        hit,
        damage,
        newHealth,
        nextTurn
      });
    }
    
    // Apply locally via shared handler
    handleSpecialAction({
      attacker,
      defender,
      hit,
      damage,
      newHealth,
      nextTurn
    });
  };

  const resetFight = () => {
    setGameState({
      player1: { health: 100, maxHealth: 100, defending: false, x: 80 },
      player2: { health: 100, maxHealth: 100, defending: false, x: 320 },
      turn: 1,
      message: `${player1Name}'s turn!`,
      isAnimating: false,
      winner: null,
      deathAnimation: 0,
      flowerGrowth: 0,
      matchRecorded: false
    });
    setBattleLog([]);
  };

  // Draw the battle scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Canvas not mounted yet or component unmounted
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas (transparent background to show BackgroundRenderer behind)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Arena floor (semi-transparent)
    ctx.fillStyle = 'rgba(15, 52, 96, 0.6)';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    // Draw characters with swords and hats
    const drawCharacter = (charColors, x, y, scale, flipped = false, isPlayer1 = true) => {
      ctx.save();
      ctx.translate(x, y);
      if (flipped) ctx.scale(-scale, scale);
      else ctx.scale(scale, scale);
      
      // Hat/Helmet
      if (isPlayer1) {
        // Knight helmet for Player 1
        ctx.fillStyle = '#708090'; // Steel gray
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        // Helmet dome
        ctx.beginPath();
        ctx.arc(0, -95, 45, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
        // Helmet visor
        ctx.fillStyle = '#2F4F4F';
        ctx.beginPath();
        ctx.rect(-30, -95, 60, 20);
        ctx.fill();
        ctx.stroke();
        // Helmet plume
        ctx.fillStyle = '#DC143C'; // Crimson
        ctx.beginPath();
        ctx.ellipse(0, -135, 8, 25, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Viking helmet for Player 2
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        // Helmet dome
        ctx.beginPath();
        ctx.arc(0, -95, 45, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
        // Horns
        ctx.fillStyle = '#F5DEB3'; // Wheat color
        ctx.beginPath();
        ctx.moveTo(-40, -100);
        ctx.quadraticCurveTo(-60, -130, -45, -150);
        ctx.quadraticCurveTo(-50, -125, -35, -100);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(40, -100);
        ctx.quadraticCurveTo(60, -130, 45, -150);
        ctx.quadraticCurveTo(50, -125, 35, -100);
        ctx.fill();
        ctx.stroke();
      }
      
      // Head
      ctx.fillStyle = charColors.head;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -80, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Eyes (determined/angry for battle)
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(-15, -85, 6, 0, Math.PI * 2);
      ctx.arc(15, -85, 6, 0, Math.PI * 2);
      ctx.fill();
      // Angry eyebrows
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-25, -100);
      ctx.lineTo(-8, -95);
      ctx.moveTo(25, -100);
      ctx.lineTo(8, -95);
      ctx.stroke();
      
      // Body
      ctx.fillStyle = charColors.body;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-30, -35, 60, 80, 10);
      ctx.fill();
      ctx.stroke();
      
      // Arms
      ctx.fillStyle = charColors.leftArm;
      ctx.beginPath();
      ctx.roundRect(-70, -30, 35, 15, 5);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = charColors.rightArm;
      ctx.beginPath();
      ctx.roundRect(35, -30, 35, 15, 5);
      ctx.fill();
      ctx.stroke();
      
      // Draw weapon based on player's choice
      const weapon = isPlayer1 ? player1Weapon : player2Weapon;
      drawWeapon(ctx, weapon, flipped);
      
      // Legs
      ctx.fillStyle = charColors.leftLeg;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-25, 50, 20, 60, 5);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = charColors.rightLeg;
      ctx.beginPath();
      ctx.roundRect(5, 50, 20, 60, 5);
      ctx.fill();
      ctx.stroke();
      
      ctx.restore();
    };
    
    // Draw Player 1 (knight helmet)
    drawCharacter(character1, gameState.player1.x, 180, 0.5, false, true);
    
    // Draw Player 2 (viking helmet, flipped)
    drawCharacter(character2, gameState.player2.x, 180, 0.5, true, false);
    
    // Draw health bars
    const drawHealthBar = (x, health, maxHealth, label, defending) => {
      const barWidth = 120;
      const barHeight = 20;
      const healthPercent = health / maxHealth;
      
      // Background
      ctx.fillStyle = '#333';
      ctx.fillRect(x, 20, barWidth + 4, barHeight + 4);
      
      // Health
      ctx.fillStyle = healthPercent > 0.3 ? '#4CAF50' : '#f44336';
      ctx.fillRect(x + 2, 22, barWidth * healthPercent, barHeight);
      
      // Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`${label}: ${health}/${maxHealth}`, x, 60);
      
      // Defending indicator
      if (defending) {
        ctx.fillStyle = '#2196F3';
        ctx.font = '12px Arial';
        ctx.fillText('🛡️ DEFENDING', x, 78);
      }
    };
    
    drawHealthBar(20, gameState.player1.health, gameState.player1.maxHealth, player1Name, gameState.player1.defending);
    drawHealthBar(260, gameState.player2.health, gameState.player2.maxHealth, player2Name, gameState.player2.defending);
    
    // Turn indicator
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.message, 200, canvas.height - 20);
    
    // Winner overlay with death animation
    if (gameState.winner) {
      const loser = gameState.winner === 1 ? 2 : 1;
      const loserX = loser === 1 ? gameState.player1.x : gameState.player2.x;
      const deathProgress = gameState.deathAnimation / 100;
      const flowerProgress = gameState.flowerGrowth / 100;
      
      // Darken background gradually
      ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + deathProgress * 0.4})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw fallen character (rotated)
      if (deathProgress > 0) {
        ctx.save();
        ctx.translate(loserX, 220);
        ctx.rotate((deathProgress * Math.PI) / 2); // Rotate to fall over
        ctx.scale(0.3, 0.3);
        
        // Simple fallen body
        const loserColors = loser === 1 ? character1 : character2;
        ctx.fillStyle = loserColors.body;
        ctx.fillRect(-30, -20, 60, 40);
        ctx.fillStyle = loserColors.head;
        ctx.beginPath();
        ctx.arc(-50, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        // X eyes (dead)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-58, -8); ctx.lineTo(-48, 2);
        ctx.moveTo(-48, -8); ctx.lineTo(-58, 2);
        ctx.moveTo(-42, -8); ctx.lineTo(-32, 2);
        ctx.moveTo(-32, -8); ctx.lineTo(-42, 2);
        ctx.stroke();
        
        ctx.restore();
      }
      
      // Draw grave when death animation complete
      if (deathProgress >= 1) {
        const graveX = loserX;
        const graveY = 200;
        
        // Grave mound (dirt)
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.ellipse(graveX, graveY + 30, 40, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Gravestone
        ctx.fillStyle = '#757575';
        ctx.beginPath();
        ctx.moveTo(graveX - 25, graveY + 20);
        ctx.lineTo(graveX - 25, graveY - 40);
        ctx.quadraticCurveTo(graveX, graveY - 60, graveX + 25, graveY - 40);
        ctx.lineTo(graveX + 25, graveY + 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // RIP text
        ctx.fillStyle = '#212121';
        ctx.font = 'bold 14px serif';
        ctx.textAlign = 'center';
        ctx.fillText('R.I.P.', graveX, graveY - 20);
        ctx.font = '10px serif';
        ctx.fillText(getPlayerName(loser), graveX, graveY - 5);
        
        // Growing flower
        if (flowerProgress > 0) {
          const flowerX = graveX + 35;
          const flowerY = graveY + 20;
          const stemHeight = 40 * flowerProgress;
          
          // Stem
          ctx.strokeStyle = '#2E7D32';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(flowerX, flowerY);
          ctx.lineTo(flowerX, flowerY - stemHeight);
          ctx.stroke();
          
          // Leaves
          if (flowerProgress > 0.3) {
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.ellipse(flowerX - 8, flowerY - stemHeight * 0.4, 8, 4, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(flowerX + 8, flowerY - stemHeight * 0.6, 8, 4, 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // Flower petals
          if (flowerProgress > 0.6) {
            const petalSize = 8 * Math.min(1, (flowerProgress - 0.6) / 0.4);
            ctx.fillStyle = '#E91E63'; // Pink
            for (let i = 0; i < 5; i++) {
              const angle = (i * Math.PI * 2) / 5;
              ctx.beginPath();
              ctx.ellipse(
                flowerX + Math.cos(angle) * petalSize,
                flowerY - stemHeight + Math.sin(angle) * petalSize,
                petalSize, petalSize * 0.6, angle, 0, Math.PI * 2
              );
              ctx.fill();
            }
            // Flower center
            ctx.fillStyle = '#FFC107';
            ctx.beginPath();
            ctx.arc(flowerX, flowerY - stemHeight, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      // Draw winner with halo
      const winnerX = gameState.winner === 1 ? gameState.player1.x : gameState.player2.x;
      const winnerColors = gameState.winner === 1 ? character1 : character2;
      
      if (deathProgress >= 0.5) {
        // Glowing halo above winner
        const haloY = 115; // Above the head
        const haloGlow = 0.5 + Math.sin(Date.now() / 200) * 0.3; // Pulsing glow
        
        // Outer glow
        ctx.save();
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20 * haloGlow;
        
        // Halo ring
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(winnerX, haloY, 25, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner bright ring
        ctx.strokeStyle = '#FFEB3B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(winnerX, haloY, 22, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
        
        // Sparkles around winner
        for (let i = 0; i < 6; i++) {
          const sparkleAngle = (Date.now() / 500 + i * Math.PI / 3) % (Math.PI * 2);
          const sparkleR = 50 + Math.sin(Date.now() / 300 + i) * 10;
          const sparkleX = winnerX + Math.cos(sparkleAngle) * sparkleR;
          const sparkleY = 160 + Math.sin(sparkleAngle) * sparkleR * 0.6;
          const sparkleSize = 3 + Math.sin(Date.now() / 200 + i * 2) * 2;
          
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          // Draw a star sparkle
          for (let j = 0; j < 4; j++) {
            const angle = j * Math.PI / 2;
            ctx.moveTo(sparkleX, sparkleY);
            ctx.lineTo(sparkleX + Math.cos(angle) * sparkleSize, sparkleY + Math.sin(angle) * sparkleSize);
          }
          ctx.stroke();
        }
      }
      
      // Big "WINNER" popup
      if (deathProgress >= 1) {
        const bounce = Math.sin(Date.now() / 150) * 5;
        
        // Winner banner background
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.beginPath();
        ctx.roundRect(winnerX - 55, 95 + bounce, 110, 35, 10);
        ctx.fill();
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // WINNER text
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 22px Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WINNER!', winnerX, 120 + bounce);
        
        // Crown emoji above
        ctx.font = '20px Arial';
        ctx.fillText('👑', winnerX, 90 + bounce);
      }
      
      // Victory text
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${getPlayerName(gameState.winner)} Wins!`, 200, 50);
      
      // Taunt message
      if (deathProgress >= 1) {
        ctx.fillStyle = '#FF5722';
        ctx.font = 'bold 22px Comic Sans MS, cursive';
        ctx.fillText(`Ha ha ${getPlayerName(loser)}, you lose! 😂`, 200, 275);
      }
    }
    
  }, [gameState, character1, character2, animationFrame, player1Name, player2Name]);

  // Show victory screen when fight ends
  if (gameState.winner && gameState.flowerGrowth >= 100) {
    const loser = gameState.winner === 1 ? 2 : 1;
    const winnerHealth = gameState.winner === 1 ? gameState.player1.health : gameState.player2.health;
    const socket = isMultiplayer ? getSocket() : null;
    
    return (
      <VictoryScreen
        winnerName={getPlayerName(gameState.winner)}
        loserName={getPlayerName(loser)}
        winnerHealth={winnerHealth}
        isWinner={!isMultiplayer || localPlayerNumber === gameState.winner}
        isMultiplayer={isMultiplayer}
        socket={socket}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fight-module">
      {/* Animated background behind everything */}
      <div style={{ position: 'relative', width: '100%', height: '300px' }}>
        <BackgroundRenderer backgroundKey={background} />
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={300} 
          className="fight-canvas"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
      
      <div className="fight-header">
        <h2>⚔️ Battle Arena</h2>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>
      
      <div className="battle-log">
        {battleLog.map((log, i) => (
          <div key={i} className="log-entry">{log}</div>
        ))}
      </div>
      
      <div className="fight-controls">
        {!gameState.winner ? (
          <>
            <button 
              className="btn btn-attack" 
              onClick={handleAttack}
              disabled={gameState.isAnimating || (isMultiplayer && !isLocalPlayerTurn)}
              title={isMultiplayer && !isLocalPlayerTurn ? "Wait for your turn" : "Attack your opponent"}
            >
              ⚔️ Attack
            </button>
            <button 
              className="btn btn-defend" 
              onClick={handleDefend}
              disabled={gameState.isAnimating || (isMultiplayer && !isLocalPlayerTurn)}
              title={isMultiplayer && !isLocalPlayerTurn ? "Wait for your turn" : "Defend against attack"}
            >
              🛡️ Defend
            </button>
            <button 
              className="btn btn-special" 
              onClick={handleSpecial}
              disabled={gameState.isAnimating || (isMultiplayer && !isLocalPlayerTurn)}
              title={isMultiplayer && !isLocalPlayerTurn ? "Wait for your turn" : "Use special attack"}
            >
              ✨ Special
            </button>
            {isMultiplayer && (
              <div className="turn-indicator" style={{
                marginTop: '10px',
                padding: '10px',
                background: isLocalPlayerTurn ? '#4ade80' : '#94a3b8',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {isLocalPlayerTurn ? '✅ YOUR TURN' : '⏳ OPPONENT\'S TURN'}
              </div>
            )}
          </>
        ) : (
          <button className="btn btn-primary" onClick={resetFight}>
            🔄 Rematch
          </button>
        )}
      </div>
      
      <div className="fight-instructions">
        <p><strong>Attack:</strong> Deal 10-25 damage</p>
        <p><strong>Defend:</strong> Reduce next hit by 50%</p>
        <p><strong>Special:</strong> 20-40 damage, 40% miss chance</p>
      </div>
    </div>
  );
}

export default FightModule;
