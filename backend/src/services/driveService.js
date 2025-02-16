import { google } from 'googleapis';
import config from '../config/config.js';

const driveService = {
  async getAuthClient() {
    const auth = new google.auth.GoogleAuth({
      credentials: config.google.credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    return auth.getClient();
  },

  async saveTranscription(videoId, transcription) {
    const auth = await this.getAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: `Transcription-${videoId}.txt`,
      parents: [config.google.folderId]
    };

    const media = {
      mimeType: 'text/plain',
      body: transcription
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    return response.data.webViewLink;
  }
};

export default driveService; 