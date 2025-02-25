import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transcriptionRoutes from './routes/transcriptionRoutes.js';
import config from './config/config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Charger les variables d'environnement depuis le fichier .env
dotenv.config({ 
  path: path.join(__dirname, '../.env'),
  debug: true
});

// Vérifier que les variables sont chargées
console.log('Variables d\'environnement chargées:');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Middleware pour les en-têtes CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  next();
});

app.use(express.json());

// Routes
app.use('/api', transcriptionRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur est survenue!' });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 