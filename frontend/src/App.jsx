import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import MainScreen from './components/MainScreen';
import CharacterMaker from './components/CharacterMaker';
import JsonEditor from './components/JsonEditor';
import ShareModal from './components/ShareModal';
import FightModule from './components/FightModule';
import FightSetup from './components/FightSetup';
import Scoreboard from './components/Scoreboard';
import ObjectLibrary from './components/ObjectLibrary';
import MultiplayerLobby from './components/MultiplayerLobby';
import MultiplayerWeaponSelector from './components/MultiplayerWeaponSelector';
import { initializeSocket, connectSocket, disconnectSocket, getSocket } from './utils/socket';

const defaultCharacter1 = {
  head: '#FFD93D',
  body: '#6BCB77',
  leftArm: '#6BCB77',
  rightArm: '#6BCB77',
  leftLeg: '#4D96FF',
  rightLeg: '#4D96FF',
  eyeColor: '#333333',
  eyeStyle: 'normal',
  mouthStyle: 'smile',
  mustache: 'none',
  hairStyle: 'none',
  hairColor: '#4A3728'
};

const defaultCharacter2 = {
  head: '#FF6B6B',
  body: '#4ECDC4',
  leftArm: '#4ECDC4',
  rightArm: '#4ECDC4',
  leftLeg: '#45B7D1',
  rightLeg: '#45B7D1',
  eyeColor: '#333333',
  eyeStyle: 'normal',
  mouthStyle: 'smile',
  mustache: 'none',
  hairStyle: 'spiky',
  hairColor: '#8B4513'
};

const defaultGameData = {
  scripts: [
    { action: 'say', text: 'Hello!', duration: 2000, target: 'player1' },
    { action: 'move', x: 50, y: 0, target: 'player1' },
    { action: 'jump', height: 30, target: 'player1' },
    { action: 'wait', ms: 500 }
  ],
  objects: []
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [screen, setScreen] = useState('main');
  const [character1, setCharacter1] = useState(defaultCharacter1);
  const [character2, setCharacter2] = useState(defaultCharacter2);
  const [activeCharacter, setActiveCharacter] = useState(1);
  const [gameData, setGameData] = useState(defaultGameData);
  const [objects, setObjects] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [showFightSetup, setShowFightSetup] = useState(false);
  const [showFight, setShowFight] = useState(false);
  const [showObjects, setShowObjects] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [showWeaponSelector, setShowWeaponSelector] = useState(false);
  const [playerNames, setPlayerNames] = useState({ player1: 'Player 1', player2: 'Player 2' });
  const [playerWeapons, setPlayerWeapons] = useState({ player1: 'sword', player2: 'sword' });
  const [selectedBackground, setSelectedBackground] = useState('dungeon');
  const [multiplayerGameData, setMultiplayerGameData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  
  // Check for existing auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Initialize socket
        initializeSocket(storedToken);
        connectSocket();
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);
  
  
  const handleLoginSuccess = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    setIsAuthenticated(true);
    
    // Initialize socket
    initializeSocket(authToken);
    connectSocket();
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    disconnectSocket();
    setScreen('main');
  };

  const handleAddObject = (obj) => {
    setObjects(prev => [...prev, obj]);
    setGameData(prev => ({
      ...prev,
      objects: [...(prev.objects || []), obj]
    }));
  };

  const handleRemoveObject = (id) => {
    setObjects(prev => prev.filter(o => o.id !== id));
    setGameData(prev => ({
      ...prev,
      objects: (prev.objects || []).filter(o => o.id !== id)
    }));
  };

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }
  
  return (
    <div className="app">
      {screen === 'main' && (
        <MainScreen
          onCharacterMaker={() => setScreen('character')}
          onJsonEditor={() => setScreen('editor')}
          onShare={() => setShowShare(true)}
          onFight={() => setShowFightSetup(true)}
          onMultiplayer={() => setShowMultiplayer(true)}
          onObjects={() => setShowObjects(true)}
          onScoreboard={() => setShowScoreboard(true)}
          onLogout={handleLogout}
          character1={character1}
          character2={character2}
          gameData={gameData}
          objects={objects}
          user={user}
        />
      )}
      
      {screen === 'character' && (
        <CharacterMaker
          character1={character1}
          character2={character2}
          activeCharacter={activeCharacter}
          setActiveCharacter={setActiveCharacter}
          onChange1={setCharacter1}
          onChange2={setCharacter2}
          onBack={() => setScreen('main')}
        />
      )}
      
      {screen === 'editor' && (
        <JsonEditor
          gameData={gameData}
          character1={character1}
          character2={character2}
          objects={objects}
          onChange={setGameData}
          onBack={() => setScreen('main')}
        />
      )}
      
      {showShare && (
        <ShareModal
          gameData={gameData}
          characterData={{ character1, character2 }}
          onClose={() => setShowShare(false)}
        />
      )}
      
      {showFightSetup && (
        <FightSetup
          multiplayerGameData={multiplayerGameData}
          onStartFight={(name1, name2, weapon1, weapon2, background) => {
            setPlayerNames({ player1: name1, player2: name2 });
            setPlayerWeapons({ player1: weapon1, player2: weapon2 });
            setSelectedBackground(background || 'dungeon');

            // If multiplayer and host, emit config to other players
            if (multiplayerGameData && isHost) {
              const socket = getSocket();
              if (socket?.connected) {
                socket.emit('game:config', {
                  roomId: currentRoomId,
                  player1Name: name1,
                  player2Name: name2,
                  player1Weapon: weapon1,
                  player2Weapon: weapon2,
                  background: background || 'dungeon'
                });
              }
            }

            setShowFightSetup(false);
            setShowFight(true);
          }}
          onCancel={() => {
            setShowFightSetup(false);
            if (multiplayerGameData) {
              setMultiplayerGameData(null);
              setShowMultiplayer(true);
            }
          }}
        />
      )}
      
      {showFight && (
        <FightModule
          character1={character1}
          character2={character2}
          player1Name={playerNames.player1}
          player2Name={playerNames.player2}
          player1Weapon={playerWeapons.player1}
          player2Weapon={playerWeapons.player2}
          background={selectedBackground}
          isMultiplayer={!!multiplayerGameData}
          multiplayerData={multiplayerGameData}
          onClose={() => {
            setShowFight(false);
            if (multiplayerGameData) {
              setMultiplayerGameData(null);
            }
          }}
        />
      )}
      
      {showScoreboard && (
        <Scoreboard onClose={() => setShowScoreboard(false)} />
      )}
      
      {showObjects && (
        <ObjectLibrary
          onAddObject={handleAddObject}
          onClose={() => setShowObjects(false)}
        />
      )}
      
      {showMultiplayer && (
        <MultiplayerLobby
          onStartGame={(gameData) => {
            setMultiplayerGameData(gameData);
            setIsHost(gameData.isHost);
            setCurrentRoomId(gameData.roomId);
            setShowMultiplayer(false);
            setShowWeaponSelector(true);
          }}
          onBack={() => setShowMultiplayer(false)}
          character1={character1}
          character2={character2}
          user={user}
        />
      )}
      
      {showWeaponSelector && multiplayerGameData && (
        <MultiplayerWeaponSelector
          isHost={isHost}
          playerName={user.username}
          opponentName={multiplayerGameData.players?.[isHost ? 1 : 0]?.username || 'Opponent'}
          roomId={currentRoomId}
          onReady={(config) => {
            setPlayerWeapons({
              player1: config.player1Weapon,
              player2: config.player2Weapon
            });
            setSelectedBackground(config.background || 'dungeon');
            if (config.player1Name && config.player2Name) {
              setPlayerNames({
                player1: config.player1Name,
                player2: config.player2Name
              });
            }
            setShowWeaponSelector(false);
            setShowFight(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
