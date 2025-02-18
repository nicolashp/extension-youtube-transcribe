import youtubeService from '../services/youtubeService.js';
import groqService from '../services/groqService.js';
import driveService from '../services/driveService.js';
import sheetsService from '../services/sheetsService.js';
import openaiService from '../services/openaiService.js';

export const transcribeVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ error: 'ID de vidéo manquant' });
    }

    // 1. Obtenir les informations de la vidéo
    const videoInfo = await youtubeService.getVideoInfo(videoId);

    // 2. Télécharger la vidéo
    const videoPath = await youtubeService.downloadVideo(videoId);

    // 3. Transcrire avec Groq
    const transcription = await groqService.transcribe(videoPath);

    // 4. Améliorer la transcription avec OpenAI
    const improvedTranscription = await openaiService.improveTranscription(transcription);

    // 5. Sauvegarder dans Google Drive avec le titre de la vidéo
    const fileUrl = await driveService.saveTranscription(videoInfo.title, improvedTranscription);

    // 6. Ajouter l'entrée dans Google Sheets
    await sheetsService.addEntry({
      title: videoInfo.title,
      videoId: videoInfo.id,
      documentUrl: fileUrl
    });

    // 7. Nettoyer le fichier temporaire
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