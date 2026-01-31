import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function ShareModal({ gameData, characterData, onClose }) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Check out my Game Maker creation!');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleShare = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject,
          gameData,
          characterData
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to share');
      }

      setResult('Game shared successfully! 🎉');
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    const fullData = {
      character: characterData,
      ...gameData
    };
    navigator.clipboard.writeText(JSON.stringify(fullData, null, 2));
    setResult('JSON copied to clipboard!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📤 Share Your Game</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="form-group">
            <label>Recipient Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
            />
          </div>
          
          <div className="form-group">
            <label>Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div className="preview-json">
            <h4>What will be shared:</h4>
            <pre>{JSON.stringify({ character: characterData, ...gameData }, null, 2)}</pre>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {result && <div className="success-message">{result}</div>}
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={handleCopyJson}>
            📋 Copy JSON
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleShare}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Sending...' : '📧 Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
