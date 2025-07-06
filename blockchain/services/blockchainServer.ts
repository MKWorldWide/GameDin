import express from 'express';
import cors from 'cors';
import { getBlockchainService } from './blockchainService';
import { BlockchainConfigFactory } from '../config/blockchain-config';

const app = express();
const port = process.env['PORT'] || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize blockchain service
const config = BlockchainConfigFactory.getConfig(process.env['NODE_ENV'] || 'development');
const blockchainService = getBlockchainService(config);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'blockchain-node' });
});

// Blockchain endpoints
app.get('/api/status', (_req, res) => {
  res.json(blockchainService.getStatus());
});

app.post('/api/transaction', async (req, res) => {
  try {
    const result = await blockchainService.batchProcessTransactions([req.body]);
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/transaction/:id', async (req, res) => {
  try {
    const result = blockchainService.getTransaction(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/transactions', async (_req, res) => {
  try {
    const result = blockchainService.getAllTransactions();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/transactions/pending', async (_req, res) => {
  try {
    const result = blockchainService.getPendingTransactions();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Gaming action endpoints
app.post('/api/gaming/action', async (req, res) => {
  try {
    const result = await blockchainService.processGamingAction(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/ai/request', async (req, res) => {
  try {
    const result = await blockchainService.processAIRequest(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Blockchain Node running on port ${port}`);
  console.log('Available endpoints:');
  console.log('  GET  /health - Health check');
  console.log('  GET  /api/status - Node status');
  console.log('  POST /api/transaction - Process transaction');
  console.log('  GET  /api/block/:hash - Get block by hash');
  console.log('  GET  /api/transactions - Get all transactions');
  console.log('  POST /api/consensus - Reach consensus');
  console.log('  POST /api/gaming/action - Process gaming action');
  console.log('  GET  /api/gaming/leaderboard - Get leaderboard');
}); 