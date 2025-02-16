import express from 'express';
import { transcribeVideo } from '../controllers/transcriptionController.js';

const router = express.Router();

router.post('/transcribe', transcribeVideo);

export default router; 