import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transcriptionRoutes from './routes/transcriptionRoutes.js';
import config from './config/config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: config.allowedOrigins,
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 heures
}));

app.use(express.json());

// Routes
app.use('/api', transcriptionRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur est survenue!' });
});

// Options preflight pour CORS
app.options('*', cors({
  origin: config.allowedOrigins,
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 