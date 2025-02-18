import dotenv from 'dotenv';

// Recharger les variables d'environnement
dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY n\'est pas définie dans les variables d\'environnement');
}

// Fonction pour parser les credentials de manière sécurisée
function parseCredentials() {
  try {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || '{}');
  } catch (error) {
    console.error('Erreur lors du parsing des credentials Google:', error);
    return {};
  }
}

export default {
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: 'whisper-large-v3'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  },
  google: {
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    credentials: parseCredentials()
  },
  allowedOrigins: [
    '*'  // Autoriser toutes les origines temporairement pour le débogage
  ]
}; 