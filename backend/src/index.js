import express from 'express';
import cors from 'cors';
import llmRoutes from './routes/llm.js';
import shareRoutes from './routes/share.js';
import scoresRoutes from './routes/scores.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/llm', llmRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/scores', scoresRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
