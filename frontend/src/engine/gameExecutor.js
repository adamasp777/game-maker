// Game script executor
// Supports: move, jump, say, wait, attack, loop, if, fart, poop
// Now with dual character support via 'target' parameter

export function executeScripts(scripts, initialState, onStateChange, onComplete) {
  let stopped = false;
  let currentState = { 
    player1: { ...initialState.player1 },
    player2: { ...initialState.player2 }
  };
  
  const updateState = (changes, target = 'player1') => {
    currentState[target] = { ...currentState[target], ...changes };
    onStateChange(changes, target);
  };

  const getPlayerState = (target) => currentState[target] || currentState.player1;

  const sleep = (ms) => new Promise(resolve => {
    const timer = setTimeout(resolve, ms);
    return () => clearTimeout(timer);
  });

  const executeAction = async (action) => {
    if (stopped) return;
    
    const target = action.target || 'player1';
    const playerState = getPlayerState(target);

    switch (action.action) {
      case 'move': {
        const targetX = playerState.x + (action.x || 0);
        const targetY = playerState.baseY - (action.y || 0);
        const steps = 20;
        const startX = playerState.x;
        const startY = playerState.y;
        const dx = (targetX - startX) / steps;
        const dy = (targetY - startY) / steps;
        
        for (let i = 0; i < steps && !stopped; i++) {
          const newX = startX + dx * (i + 1);
          const newY = startY + dy * (i + 1);
          updateState({ x: newX, y: newY }, target);
          await sleep(20);
        }
        updateState({ baseY: targetY }, target);
        break;
      }
      
      case 'jump': {
        const height = action.height || 50;
        const duration = action.duration || 500;
        const steps = 20;
        const halfSteps = steps / 2;
        const baseY = playerState.baseY;
        
        // Go up
        for (let i = 0; i < halfSteps && !stopped; i++) {
          const progress = i / halfSteps;
          const jumpY = baseY - (height * Math.sin(progress * Math.PI / 2));
          updateState({ y: jumpY }, target);
          await sleep(duration / steps);
        }
        
        // Come down
        for (let i = 0; i < halfSteps && !stopped; i++) {
          const progress = i / halfSteps;
          const jumpY = baseY - (height * Math.cos(progress * Math.PI / 2));
          updateState({ y: jumpY }, target);
          await sleep(duration / steps);
        }
        
        updateState({ y: baseY }, target);
        break;
      }
      
      case 'say': {
        updateState({ message: action.text }, target);
        await sleep(action.duration || 2000);
        updateState({ message: null }, target);
        break;
      }
      
      case 'wait': {
        await sleep(action.ms || 1000);
        break;
      }
      
      case 'attack': {
        updateState({ isAttacking: true }, target);
        await sleep(200);
        updateState({ isAttacking: false }, target);
        break;
      }
      
      case 'fart': {
        // Create fart cloud effect
        const fartX = playerState.x - 30;
        const fartY = playerState.y + 20;
        updateState({ 
          isFarting: true, 
          fartCloud: { x: fartX, y: fartY, opacity: 1, size: 1 } 
        }, target);
        
        // Animate fart cloud rising and fading
        for (let i = 0; i < 20 && !stopped; i++) {
          await sleep(50);
          updateState({
            fartCloud: {
              x: fartX - i * 2,
              y: fartY - i * 3,
              opacity: 1 - (i / 20),
              size: 1 + (i / 10)
            }
          }, target);
        }
        
        updateState({ isFarting: false, fartCloud: null }, target);
        break;
      }
      
      case 'poop': {
        // Create poop effect
        const poopX = playerState.x - 20;
        const poopY = playerState.baseY + 30;
        updateState({ isPooping: true }, target);
        await sleep(300);
        
        // Add poop to the ground
        updateState({ 
          isPooping: false,
          poops: [...(playerState.poops || []), { x: poopX, y: poopY, time: Date.now() }]
        }, target);
        break;
      }
      
      case 'loop': {
        const count = action.count || 1;
        const body = action.body || [];
        
        for (let i = 0; i < count && !stopped; i++) {
          for (const subAction of body) {
            if (stopped) break;
            await executeAction(subAction);
          }
        }
        break;
      }
      
      case 'if': {
        const condition = evaluateCondition(action.condition, playerState);
        const branch = condition ? action.then : action.else;
        
        if (branch && Array.isArray(branch)) {
          for (const subAction of branch) {
            if (stopped) break;
            await executeAction(subAction);
          }
        }
        break;
      }
      
      default:
        console.warn('Unknown action:', action.action);
    }
  };

  const evaluateCondition = (condition, state) => {
    if (!condition) return false;
    
    // Simple condition parser
    // Supports: "health > 50", "health < 30", "health == 100", "x > 200"
    const match = condition.match(/(\w+)\s*(>|<|==|>=|<=|!=)\s*(\d+)/);
    if (!match) return false;
    
    const [, variable, operator, valueStr] = match;
    const stateValue = state[variable];
    const compareValue = parseInt(valueStr, 10);
    
    if (stateValue === undefined) return false;
    
    switch (operator) {
      case '>': return stateValue > compareValue;
      case '<': return stateValue < compareValue;
      case '>=': return stateValue >= compareValue;
      case '<=': return stateValue <= compareValue;
      case '==': return stateValue === compareValue;
      case '!=': return stateValue !== compareValue;
      default: return false;
    }
  };

  const run = async () => {
    for (const script of scripts) {
      if (stopped) break;
      await executeAction(script);
    }
    if (!stopped) {
      onComplete();
    }
  };

  run();

  return {
    stop: () => {
      stopped = true;
    }
  };
}
