import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT) || 25,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

router.post('/', async (req, res) => {
  const { to, subject, gameData, characterData } = req.body;
  
  if (!to || !gameData) {
    return res.status(400).json({ error: 'Recipient email and game data are required' });
  }
  
  const gameContent = JSON.stringify(gameData, null, 2);
  const characterContent = characterData ? JSON.stringify(characterData, null, 2) : null;
  
  const htmlBody = `
    <h1>🎮 Game Maker - Shared Game</h1>
    <p>Someone shared a game with you!</p>
    
    <h2>Game Script</h2>
    <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">
${gameContent}
    </pre>
    
    ${characterContent ? `
    <h2>Character Data</h2>
    <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">
${characterContent}
    </pre>
    ` : ''}
    
    <p>Import this JSON into Game Maker to play!</p>
  `;
  
  try {
    await transporter.sendMail({
      from: '"Game Maker" <gamemaker@gamemaker.local>',
      to,
      subject: subject || 'Check out my Game Maker creation!',
      html: htmlBody,
      attachments: [
        {
          filename: 'game.json',
          content: gameContent
        }
      ]
    });
    
    res.json({ success: true, message: 'Game shared successfully!' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send email', 
      message: error.message 
    });
  }
});

export default router;
