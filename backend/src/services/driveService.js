import { google } from 'googleapis';
import config from '../config/config.js';

const driveService = {
  async getAuthClient() {
    const auth = new google.auth.GoogleAuth({
      credentials: config.google.credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/documents'
      ]
    });
    return auth.getClient();
  },

  async saveTranscription(title, transcription) {
    const auth = await this.getAuthClient();
    const drive = google.drive({ version: 'v3', auth });
    const docs = google.docs({ version: 'v1', auth });

    const fileMetadata = {
      name: `Transcription - ${title}`,
      parents: [config.google.folderId],
      mimeType: 'application/vnd.google-apps.document'
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, webViewLink'
    });

    await docs.documents.batchUpdate({
      documentId: response.data.id,
      requestBody: {
        requests: [{
          insertText: {
            location: {
              index: 1
            },
            text: transcription
          }
        }]
      }
    });

    await docs.documents.batchUpdate({
      documentId: response.data.id,
      requestBody: {
        requests: [{
          insertText: {
            location: {
              index: 1
            },
            text: `Transcription de : ${title}\nDate : ${new Date().toLocaleDateString('fr-FR')}\n\n`
          }
        }]
      }
    });

    return response.data.webViewLink;
  }
};

export default driveService; 