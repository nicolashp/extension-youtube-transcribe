import ytdlp from 'yt-dlp-exec';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '../../temp');
const YT_DLP_PATH = path.join(__dirname, '../../bin/yt-dlp');
const COOKIES_PATH = path.join(TEMP_DIR, 'cookies.txt');

// Cookies YouTube minimaux nécessaires
const YOUTUBE_COOKIES = `# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	2597573456	CONSENT	PENDING+355
.youtube.com	TRUE	/	TRUE	2597573456	VISITOR_INFO1_LIVE	6_ZpwFLxC8A
.youtube.com	TRUE	/	TRUE	2597573456	LOGIN_INFO	AFmmF2swRQIhANPZr0lFZKHYqEX9_bHN_bzOYL_QWqwZ3lmZYUBB2KVoAiB2Yf6k3JwTgf0cU8QKtVoCG-0RgfrM6gQHVe-SD-B-Zg:QUQ3MjNmd3VnMmJYVEF5SGhGYjBVZmJVTnBQbUNqNWJLbHhqQUhkcWlDTjVsNHBJLWFKY0lQUmFXQnJRYjBhRmhvUjVyTHJBY0lQRmRyTXBKSHVhZmFVdnVUUHZxUGFyTmVGRmRJZnZQbmFLbVBfRnVhWnVHRnJxTnVhVnVLbmxBTXBxWVBfRHhzRnBkTmxBbmFVWHJfRHhYbWRR
.youtube.com	TRUE	/	TRUE	2597573456	SID	ZQjWZU-xLqwXw3c3Bv0taTkxNJeEhAVX3_bJ3wJj2QPTWYBBpwJ-UZgHHtylgWF9FHDqQA.
.youtube.com	TRUE	/	TRUE	2597573456	__Secure-1PSID	ZQjWZU-xLqwXw3c3Bv0taTkxNJeEhAVX3_bJ3wJj2QPTWYBBJfKqgYvHHtylgWF9FHDqQA.
.youtube.com	TRUE	/	TRUE	2597573456	__Secure-3PSID	ZQjWZU-xLqwXw3c3Bv0taTkxNJeEhAVX3_bJ3wJj2QPTWYBBCc8yF9THHtylgWF9FHDqQA.
.youtube.com	TRUE	/	TRUE	2597573456	HSID	AKHr8rLqL8_KV9Z7d
.youtube.com	TRUE	/	TRUE	2597573456	SSID	A5_z8r9XLZ3qL8_Kd
.youtube.com	TRUE	/	TRUE	2597573456	APISID	TJ9_z8r9XLZ3qL8_K/A5_z8rLqL8_KV9Z7
.youtube.com	TRUE	/	TRUE	2597573456	SAPISID	TJ9_z8r9XLZ3qL8_K/A5_z8rLqL8_KV9Z7
.youtube.com	TRUE	/	TRUE	2597573456	__Secure-1PAPISID	TJ9_z8r9XLZ3qL8_K/A5_z8rLqL8_KV9Z7
.youtube.com	TRUE	/	TRUE	2597573456	__Secure-3PAPISID	TJ9_z8r9XLZ3qL8_K/A5_z8rLqL8_KV9Z7`;

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
      await writeFile(COOKIES_PATH, YOUTUBE_COOKIES);
      return COOKIES_PATH;
    } catch (error) {
      console.error('Erreur lors de la création du fichier cookies:', error);
      throw new Error('Erreur de configuration des cookies');
    }
  },

  async downloadVideo(videoId) {
    await this.ensureTempDir();
    const cookiesPath = await this.setupCookies();
    const outputPath = path.join(TEMP_DIR, `${videoId}.mp3`);
    
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    try {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const command = [
        YT_DLP_PATH,
        '--format', 'bestaudio[ext=m4a]',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--no-warnings',
        '--no-check-certificate',
        '--geo-bypass',
        '--add-header', `'Referer: https://www.youtube.com'`,
        '--add-header', `'Origin: https://www.youtube.com'`,
        '--no-playlist',
        '--user-agent', `'${userAgent}'`,
        '--cookies', `'${cookiesPath}'`,
        '--extractor-args', `'youtube:player_client=android'`,
        '-o', `'${outputPath}'`,
        `'${url}'`
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
      if (error.stderr) console.error('Stderr:', error.stderr);
      if (error.stdout) console.error('Stdout:', error.stdout);
      throw error;
    } finally {
      // Nettoyage du fichier de cookies
      try {
        await fs.unlink(cookiesPath);
      } catch (error) {
        console.error('Erreur lors du nettoyage des cookies:', error);
      }
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