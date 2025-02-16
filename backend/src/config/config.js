export default {
  gladia: {
    apiKey: process.env.GLADIA_API_KEY,
    apiUrl: 'https://api.gladia.io/audio/text/audio-transcription/'
  },
  google: {
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || '{}')
  },
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
}; 