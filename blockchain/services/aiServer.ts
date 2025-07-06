import express from 'express';
import cors from 'cors';
import { getNovaSanctumAI } from './novaSanctumAI';
import { BlockchainConfigFactory } from '../config/blockchain-config';

const app = express();
const port = process.env['PORT'] || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI service
const config = BlockchainConfigFactory.getConfig(process.env['NODE_ENV'] || 'development');
const aiService = getNovaSanctumAI(config.ai);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'nova-sanctum-ai' });
});

// AI service endpoints
app.post('/api/anti-cheat', async (req, res) => {
  try {
    const result = await aiService.detectCheating(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/matchmaking', async (req, res) => {
  try {
    const result = await aiService.findMatch(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/content-generation', async (req, res) => {
  try {
    const result = await aiService.generateContent(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/analytics', async (req, res) => {
  try {
    const result = await aiService.processAnalytics(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Status endpoint
app.get('/api/status', (_req, res) => {
  res.json(aiService.getStatus());
});

// Start server
app.listen(port, () => {
  console.log(`NovaSanctum AI Service running on port ${port}`);
  console.log('Available endpoints:');
  console.log('  GET  /health - Health check');
  console.log('  GET  /api/status - Service status');
  console.log('  POST /api/anti-cheat - Anti-cheat detection');
  console.log('  POST /api/matchmaking - Intelligent matchmaking');
  console.log('  POST /api/content-generation - Content generation');
  console.log('  POST /api/analytics - Analytics processing');
}); 