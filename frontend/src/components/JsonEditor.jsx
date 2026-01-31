import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import LlmAssistant from './LlmAssistant';
import GameCanvas from './GameCanvas';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function JsonEditor({ gameData, character1, character2, objects, onChange, onBack }) {
  const [jsonText, setJsonText] = useState(JSON.stringify(gameData, null, 2));
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLlm, setShowLlm] = useState(false);

  const handleEditorChange = (value) => {
    setJsonText(value);
    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
      setError(null);
    } catch (e) {
      setError('Invalid JSON: ' + e.message);
    }
  };

  const handleLlmResult = (result) => {
    if (result && result.scripts) {
      const newData = { ...gameData, scripts: result.scripts };
      setJsonText(JSON.stringify(newData, null, 2));
      onChange(newData);
      setError(null);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      setError('Cannot format: Invalid JSON');
    }
  };

  return (
    <div className="json-editor">
      <div className="header">
        <button className="btn btn-back" onClick={onBack}>← Back</button>
        <h1>📝 JSON Editor</h1>
        <div className="header-actions">
          <button className="btn btn-small" onClick={formatJson}>Format</button>
          <button className="btn btn-small btn-ai" onClick={() => setShowLlm(!showLlm)}>
            🤖 {showLlm ? 'Hide' : 'AI'} Assistant
          </button>
        </div>
      </div>
      
      <div className="editor-content">
        <div className="editor-panel">
          <Editor
            height="400px"
            language="json"
            theme="vs-dark"
            value={jsonText}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true
            }}
          />
          {error && <div className="error-message">{error}</div>}
          
          {showLlm && (
            <LlmAssistant 
              onResult={handleLlmResult}
              currentJson={jsonText}
            />
          )}
        </div>
        
        <div className="preview-panel">
          <h3>Preview</h3>
          <GameCanvas 
            character1={character1}
            character2={character2}
            gameData={gameData}
            objects={objects}
            isPlaying={isPlaying}
            onComplete={() => setIsPlaying(false)}
          />
          <button 
            className="btn btn-play" 
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!!error}
          >
            {isPlaying ? '⏹ Stop' : '▶ Execute'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JsonEditor;
