import express from 'express';
import { transcribeVideo } from '../controllers/transcriptionController.js';
import config from '../config/config.js';

const router = express.Router();

// Middleware pour les en-têtes CORS
router.use((req, res, next) => {
  const origin = req.headers.origin;
  if (config.allowedOrigins.includes(origin) || 
      (origin && origin.startsWith('chrome-extension://'))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

router.post('/transcribe', transcribeVideo);

export default router; 