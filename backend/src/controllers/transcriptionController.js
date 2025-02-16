import youtubeService from '../services/youtubeService.js';
import gladiaService from '../services/gladiaService.js';
import driveService from '../services/driveService.js';

export const transcribeVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ error: 'ID de vidéo manquant' });
    }

    // 1. Télécharger la vidéo
    const videoPath = await youtubeService.downloadVideo(videoId);

    // 2. Transcrire avec Gladia
    const transcription = await gladiaService.transcribe(videoPath);

    // 3. Sauvegarder dans Google Drive
    const fileUrl = await driveService.saveTranscription(videoId, transcription);

    // 4. Nettoyer le fichier temporaire
    await youtubeService.cleanupVideo(videoPath);

    res.json({ 
      success: true, 
      fileUrl,
      message: 'Transcription terminée avec succès'
    });

  } catch (error) {
    console.error('Erreur de transcription:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la transcription',
      details: error.message 
    });
  }
}; 