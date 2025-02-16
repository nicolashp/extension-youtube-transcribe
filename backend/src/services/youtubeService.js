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

// Cookies YouTube (à remplacer par vos propres cookies)
const YOUTUBE_COOKIES = `
# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	1735689600	CONSENT	YES+cb.20231213-07-p0.fr+FX+733
.youtube.com	TRUE	/	TRUE	1735689600	LOGIN_INFO	AFmmF2swRQIhAI6LSWgx...
`;

const COOKIES_PATH = path.join(TEMP_DIR, 'youtube_cookies.txt');

const youtubeService = {
  async ensureTempDir() {
    try {
      await fs.access(TEMP_DIR);
    } catch {
      await fs.mkdir(TEMP_DIR, { recursive: true });
    }
  },

  async setupCookies() {
    try {
      await fs.writeFile(COOKIES_PATH, YOUTUBE_COOKIES);
    } catch (error) {
      console.error('Erreur lors de la création du fichier cookies:', error);
      throw new Error('Erreur de configuration des cookies');
    }
  },

  async downloadVideo(videoId) {
    await this.ensureTempDir();
    const outputPath = path.join(TEMP_DIR, `${videoId}.mp3`);
    
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    try {
      // Utiliser un format qui ne nécessite pas d'authentification
      await execAsync(`${YT_DLP_PATH} -x --audio-format mp3 --format "bestaudio[ext=m4a]" --no-check-certificates -o "${outputPath}" ${url}`);
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