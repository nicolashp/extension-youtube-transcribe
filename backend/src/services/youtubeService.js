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
      const command = [
        YT_DLP_PATH,
        '--format', 'm4a/bestaudio/best',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--no-warnings',
        '--no-check-certificate',
        '--prefer-insecure',
        '--no-cache-dir',
        '--rm-cache-dir',
        '--no-playlist',
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        '-o', `"${outputPath}"`,
        `"${url}"`
      ].join(' ');
      
      console.log('Exécution de la commande:', command);
      await execAsync(command);
      const stats = await fs.stat(outputPath);
      if (stats.size === 0) {
        throw new Error('Le fichier téléchargé est vide');
      }
      return outputPath;
    } catch (error) {
      console.error('Erreur lors de l\'exécution de yt-dlp:', error);
      throw error;
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