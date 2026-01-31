import llamaTokenizer from 'llama-tokenizer-js';

const SYSTEM_PROMPT = `You are a game script generator. Generate valid JSON for a simple 2-player game engine.

Available actions (use "target": "player1" or "player2" to specify which character):
- { "action": "move", "x": number, "y": number, "target": "player1" }
- { "action": "jump", "height": number, "target": "player1" }
- { "action": "say", "text": "string", "duration": number, "target": "player1" }
- { "action": "wait", "ms": number }
- { "action": "attack", "damage": number, "target": "player1" }
- { "action": "loop", "count": number, "body": [actions...] }
- { "action": "if", "condition": "string", "then": [actions...], "else": [actions...] }

Available objects to place: tree, rock, coin, platform, enemy, heart, star, cloud, bush, crate, spike, flag, potion, sword, shield
Objects format: { "type": "tree", "x": 200, "y": 250, "scale": 1, "id": unique_number }

Respond ONLY with valid JSON in this format:
{
  "scripts": [...],
  "objects": [...]
}`;

export function countTokens(text) {
  return llamaTokenizer.encode(text).length;
}

export function estimateTokens(userPrompt) {
  const fullPrompt = SYSTEM_PROMPT + '\n\nUser request: ' + userPrompt;
  const inputTokens = countTokens(fullPrompt);
  // Estimate output tokens (rough estimate: 2x input for generation)
  const estimatedOutputTokens = Math.min(inputTokens * 2, 2000);
  
  return {
    inputTokens,
    estimatedOutputTokens,
    totalEstimated: inputTokens + estimatedOutputTokens,
    systemPromptTokens: countTokens(SYSTEM_PROMPT),
    userPromptTokens: countTokens(userPrompt)
  };
}

export function getSystemPrompt() {
  return SYSTEM_PROMPT;
}
