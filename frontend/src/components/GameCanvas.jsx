import React, { useRef, useEffect, useState } from 'react';
import { executeScripts } from '../engine/gameExecutor';
import { GAME_OBJECTS } from './ObjectLibrary';

function GameCanvas({ character1, character2, gameData, objects = [], isPlaying, onComplete }) {
  const canvasRef = useRef(null);
  const [state, setState] = useState({
    player1: { x: 80, y: 150, baseY: 150, health: 100, message: null, isAttacking: false, isFarting: false, fartCloud: null, isPooping: false, poops: [] },
    player2: { x: 300, y: 150, baseY: 150, health: 100, message: null, isAttacking: false, isFarting: false, fartCloud: null, isPooping: false, poops: [] }
  });
  const executorRef = useRef(null);

  // Reset state when not playing
  useEffect(() => {
    if (!isPlaying) {
      setState({
        player1: { x: 80, y: 150, baseY: 150, health: 100, message: null, isAttacking: false, isFarting: false, fartCloud: null, isPooping: false, poops: [] },
        player2: { x: 300, y: 150, baseY: 150, health: 100, message: null, isAttacking: false, isFarting: false, fartCloud: null, isPooping: false, poops: [] }
      });
      if (executorRef.current) {
        executorRef.current.stop();
        executorRef.current = null;
      }
    }
  }, [isPlaying]);

  // Execute scripts when playing
  useEffect(() => {
    if (isPlaying && gameData?.scripts) {
      executorRef.current = executeScripts(
        gameData.scripts,
        state,
        (newState, target = 'player1') => {
          setState(prev => ({
            ...prev,
            [target]: { ...prev[target], ...newState }
          }));
        },
        () => {
          onComplete();
        }
      );
    }

    return () => {
      if (executorRef.current) {
        executorRef.current.stop();
      }
    };
  }, [isPlaying]);

  // Draw character helper
  const drawCharacter = (ctx, charColors, x, y, scale, playerState, flipped = false) => {
    ctx.save();
    ctx.translate(x, y);
    if (flipped) ctx.scale(-scale, scale);
    else ctx.scale(scale, scale);
    
    // Attack effect
    if (playerState.isAttacking) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(flipped ? -50 : 50, 0, 80, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Head
    ctx.fillStyle = charColors.head;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -80, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-15, -85, 5, 0, Math.PI * 2);
    ctx.arc(15, -85, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.beginPath();
    ctx.moveTo(-15, -70);
    ctx.quadraticCurveTo(0, -55, 15, -70);
    ctx.stroke();
    
    // Body
    ctx.fillStyle = charColors.body;
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
    
    // Legs
    ctx.fillStyle = charColors.leftLeg;
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
    
    // Speech bubble
    if (playerState.message) {
      const bubbleX = x + (flipped ? -120 : 40);
      const bubbleY = y - 80;
      
      ctx.fillStyle = 'white';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.roundRect(bubbleX, bubbleY - 20, Math.max(80, playerState.message.length * 7 + 15), 35, 8);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.fillText(playerState.message, bubbleX + 8, bubbleY + 3);
    }
    
    // Fart cloud effect
    if (playerState.fartCloud) {
      const cloud = playerState.fartCloud;
      const cloudX = x + (flipped ? 30 : -30);
      const cloudY = y + 10;
      
      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      
      // Draw multiple cloud puffs in green/brown colors
      const colors = ['#90EE90', '#98FB98', '#8FBC8F', '#9ACD32'];
      for (let i = 0; i < 5; i++) {
        const offsetX = (i - 2) * 8 * cloud.size;
        const offsetY = Math.sin(i * 1.5) * 5 * cloud.size;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(cloudX + offsetX + (cloud.x - (x - 30)), cloudY + offsetY + (cloud.y - (y + 20)), 8 * cloud.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Stink lines
      ctx.strokeStyle = '#6B8E23';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const startX = cloudX + (i - 1) * 10;
        ctx.moveTo(startX, cloudY - 10);
        ctx.quadraticCurveTo(startX + 5, cloudY - 20, startX, cloudY - 30);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    // Pooping face effect
    if (playerState.isPooping) {
      // Draw strained face
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      
      // Red face for straining
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(0, -80, 42, 0, Math.PI * 2);
      ctx.fill();
      
      // Sweat drops
      ctx.fillStyle = '#87CEEB';
      ctx.beginPath();
      ctx.ellipse(-30, -90, 3, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(30, -85, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  };
  
  // Draw poop emoji
  const drawPoop = (ctx, x, y) => {
    ctx.save();
    ctx.translate(x, y);
    
    // Poop base (brown swirl)
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -5, -12, -15, -8, -20);
    ctx.bezierCurveTo(-5, -25, 5, -25, 8, -20);
    ctx.bezierCurveTo(12, -15, 10, -5, 0, 0);
    ctx.fill();
    
    // Poop top swirl
    ctx.beginPath();
    ctx.arc(0, -22, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-3, -18, 3, 0, Math.PI * 2);
    ctx.arc(3, -18, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-3, -18, 1.5, 0, Math.PI * 2);
    ctx.arc(3, -18, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -12, 4, 0, Math.PI);
    ctx.stroke();
    
    ctx.restore();
  };

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear - sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // Draw objects
    const gameObjects = objects || gameData?.objects || [];
    gameObjects.forEach(obj => {
      if (GAME_OBJECTS[obj.type]) {
        GAME_OBJECTS[obj.type].render(ctx, obj.x, obj.y, obj.scale || 1);
      }
    });
    
    // Draw all poops on the ground
    [...(state.player1.poops || []), ...(state.player2.poops || [])].forEach(poop => {
      drawPoop(ctx, poop.x, poop.y);
    });
    
    // Draw Player 1
    if (character1) {
      drawCharacter(ctx, character1, state.player1.x, state.player1.y, 0.4, state.player1, false);
    }
    
    // Draw Player 2
    if (character2) {
      drawCharacter(ctx, character2, state.player2.x, state.player2.y, 0.4, state.player2, true);
    }
    
    // Health bars
    const drawHealthBar = (x, health, label) => {
      ctx.fillStyle = '#333';
      ctx.fillRect(x, 10, 84, 18);
      ctx.fillStyle = health > 30 ? '#4CAF50' : '#f44336';
      ctx.fillRect(x + 2, 12, (health / 100) * 80, 14);
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.fillText(`${label}: ${health}`, x + 5, 23);
    };
    
    drawHealthBar(10, state.player1.health, 'P1');
    drawHealthBar(306, state.player2.health, 'P2');
    
  }, [state, character1, character2, objects, gameData]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={300}
      className="game-canvas"
    />
  );
}

export default GameCanvas;
