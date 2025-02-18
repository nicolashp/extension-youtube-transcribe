import youtubeDl from 'youtube-dl-exec';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '../../temp');

// Fonction pour vérifier si ffmpeg est installé
function getFfmpegPath() {
  try {
    return execSync('which ffmpeg').toString().trim();
  } catch (error) {
    console.error('ffmpeg n\'est pas installé. Veuillez installer ffmpeg avec : brew install ffmpeg');
    return null;
  }
}

const FFMPEG_PATH = getFfmpegPath();

const youtubeService = {
  async ensureTempDir() {
    try {
      await fs.access(TEMP_DIR);
    } catch {
      await fs.mkdir(TEMP_DIR, { recursive: true });
    }
  },

  async getVideoInfo(videoId) {
    try {
      const info = await youtubeDl(
        `https://www.youtube.com/watch?v=${videoId}`,
        {
          dumpSingleJson: true,
          noWarnings: true,
          noCheckCertificates: true,
          skipDownload: true,
          format: 'best'
        }
      );

      if (!info || !info.title) {
        console.error('Titre non trouvé dans les infos:', info);
        throw new Error('Impossible de récupérer le titre de la vidéo');
      }

      console.log('Infos vidéo récupérées:', {
        title: info.title,
        id: videoId
      });

      return {
        title: info.title,
        id: videoId
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des infos:', error);
      console.error('Détails:', error.message);
      if (error.stderr) console.error('Stderr:', error.stderr);
      const defaultTitle = new Date().toLocaleDateString('fr-FR') + ` - Video ${videoId}`;
      return { title: defaultTitle, id: videoId };
    }
  },

  async downloadVideo(videoId) {
    if (!FFMPEG_PATH) {
      throw new Error('ffmpeg n\'est pas installé. Veuillez installer ffmpeg avec : brew install ffmpeg');
    }

    await this.ensureTempDir();
    const outputPath = path.join(TEMP_DIR, `${videoId}.mp3`);
    
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    try {
      await youtubeDl(url, {
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: 9,
        output: outputPath,
        noWarnings: true,
        noCheckCertificates: true,
        preferFreeFormats: true,
        format: 'worstaudio',
        ffmpegLocation: FFMPEG_PATH
      });

      return outputPath;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      console.error('Détails:', error.message);
      if (error.stderr) console.error('Stderr:', error.stderr);
      throw new Error('Erreur lors du téléchargement de la vidéo');
    }
  },

  async cleanupVideo(videoPath) {
    try {
      await fs.unlink(videoPath);
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }
};

export default youtubeService; 