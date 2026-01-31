import express from 'express';
import { estimateTokens, getSystemPrompt } from '../utils/tokenCounter.js';

const router = express.Router();
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Estimate tokens before generation
router.post('/estimate', (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  const estimate = estimateTokens(prompt);
  res.json(estimate);
});

// Generate JSON using Ollama
router.post('/generate', async (req, res) => {
  const { prompt, model = 'llama3' } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${getSystemPrompt()}\n\nUser request: ${prompt}`,
        stream: false,
        format: 'json'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Try to parse the response as JSON
    let gameJson;
    try {
      gameJson = JSON.parse(data.response);
    } catch {
      gameJson = { scripts: [], error: 'Failed to parse LLM response as JSON' };
    }
    
    res.json({
      success: true,
      gameJson,
      tokensUsed: {
        prompt: data.prompt_eval_count || 0,
        completion: data.eval_count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate', 
      message: error.message 
    });
  }
});

// List available models
router.get('/models', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) {
      return res.json([]);
    }
    const data = await response.json();
    res.json(data.models || []);
  } catch (error) {
    // Return empty array if Ollama is unreachable
    res.json([]);
  }
});

// Health check for Ollama connection
router.get('/health', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    res.json({ 
      connected: response.ok,
      url: OLLAMA_URL
    });
  } catch (error) {
    res.json({ 
      connected: false, 
      url: OLLAMA_URL,
      error: error.message 
    });
  }
});

export default router;
