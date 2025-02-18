import { google } from 'googleapis';
import config from '../config/config.js';

const SPREADSHEET_ID = '11lQSkGOrcV4vlj36iAw4tnn_G5olJ0Au9o7xN5kKMn4';
const RANGE = 'A:D';  // Colonnes A à D
const CACHE_DURATION = 60 * 1000; // 1 minute en millisecondes

const sheetsService = {
  cache: {
    data: null,
    lastUpdate: 0
  },

  async getAuthClient() {
    const auth = new google.auth.GoogleAuth({
      credentials: config.google.credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    return auth.getClient();
  },

  async refreshCache() {
    const now = Date.now();
    if (this.cache.data && now - this.cache.lastUpdate < CACHE_DURATION) {
      return this.cache.data;
    }

    try {
      const auth = await this.getAuthClient();
      const sheets = google.sheets({ version: 'v4', auth });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE
      });

      this.cache.data = response.data.values || [];
      this.cache.lastUpdate = now;
      return this.cache.data;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du cache:', error);
      return this.cache.data || [];
    }
  },

  async isVideoTranscribed(videoId) {
    const rows = await this.refreshCache();
    return rows.some(row => row[2]?.includes(videoId));
  },

  async addEntry({ title, videoId, documentUrl }) {
    const auth = await this.getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const date = new Date().toLocaleDateString('fr-FR');
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          date,
          title,
          videoUrl,
          documentUrl
        ]]
      }
    });

    await this.refreshCache();
  }
};

export default sheetsService; 