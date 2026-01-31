import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function LlmAssistant({ onResult, currentJson }) {
  const [prompt, setPrompt] = useState('');
  const [tokenEstimate, setTokenEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Debounced token estimation
  useEffect(() => {
    if (!prompt.trim()) {
      setTokenEstimate(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsEstimating(true);
      try {
        const res = await fetch(`${API_URL}/api/llm/estimate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        setTokenEstimate(data);
      } catch (e) {
        console.error('Token estimation failed:', e);
      } finally {
        setIsEstimating(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [prompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/llm/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Generation failed');
      }

      setResult(data);
      if (data.gameJson && !data.gameJson.error) {
        onResult(data.gameJson);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="llm-assistant">
      <h3>🤖 AI Assistant</h3>
      <p className="hint">Describe what you want your game to do:</p>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Example: Make the character walk right, jump 3 times, then say 'I made it!'"
        rows={3}
      />
      
      {tokenEstimate && (
        <div className="token-estimate">
          <h4>📊 Token Estimate</h4>
          <div className="token-grid">
            <span>System prompt:</span>
            <span>{tokenEstimate.systemPromptTokens} tokens</span>
            <span>Your prompt:</span>
            <span>{tokenEstimate.userPromptTokens} tokens</span>
            <span>Input total:</span>
            <span>{tokenEstimate.inputTokens} tokens</span>
            <span>Est. output:</span>
            <span>~{tokenEstimate.estimatedOutputTokens} tokens</span>
            <span className="total">Total estimated:</span>
            <span className="total">~{tokenEstimate.totalEstimated} tokens</span>
          </div>
          {isEstimating && <span className="estimating">Updating...</span>}
        </div>
      )}
      
      <button 
        className="btn btn-generate"
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? '⏳ Generating...' : '✨ Generate JSON'}
      </button>
      
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
      
      {result && result.tokensUsed && (
        <div className="result-info">
          <h4>✅ Generated!</h4>
          <p>Tokens used: {result.tokensUsed.prompt} (prompt) + {result.tokensUsed.completion} (completion)</p>
        </div>
      )}
    </div>
  );
}

export default LlmAssistant;
