import ytdlp from 'yt-dlp-exec';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '../../temp');
const YT_DLP_PATH = path.join(__dirname, '../../bin/yt-dlp');

const youtubeService = {
  async ensureTempDir() {
    try {
      await fs.access(TEMP_DIR);
    } catch {
      await fs.mkdir(TEMP_DIR, { recursive: true });
    }
  },

  async downloadVideo(videoId) {
    await this.ensureTempDir();
    const outputPath = path.join(TEMP_DIR, `${videoId}.mp3`);
    
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    try {
      // Commande optimisée pour éviter l'authentification
      const command = [
        YT_DLP_PATH,
        '--format', 'bestaudio[ext=m4a]',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--no-check-certificates',
        '--no-warnings',
        '-o', `"${outputPath}"`,
        `"${url}"`
      ].join(' ');
      
      await execAsync(command);
      return outputPath;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
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