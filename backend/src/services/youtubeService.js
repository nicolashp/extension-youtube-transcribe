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
        '--format', 'worstaudio',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '9',
        '--no-warnings',
        '--force-ipv4',
        '--no-check-certificate',
        '-o', `"${outputPath}"`,
        `"${url}"`
      ].join(' ');
      
      console.log('Exécution de la commande:', command);
      await execAsync(command);
      return outputPath;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      if (error.stderr) console.error('Stderr:', error.stderr);
      if (error.stdout) console.error('Stdout:', error.stdout);
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