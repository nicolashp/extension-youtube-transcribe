import express from 'express';
import { transcribeVideo } from '../controllers/transcriptionController.js';
import config from '../config/config.js';
import sheetsService from '../services/sheetsService.js';

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

// Route pour la transcription
router.post('/transcribe', transcribeVideo);

// Route pour vérifier le statut d'une transcription
router.get('/transcription/status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const isTranscribed = await sheetsService.isVideoTranscribed(videoId);
    res.json({ isTranscribed });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

export default router; 