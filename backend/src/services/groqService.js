import Groq from 'groq-sdk';
import fs from 'fs';
import config from '../config/config.js';

const groqService = {
  async transcribe(audioFilePath) {
    if (!config.groq.apiKey) {
      throw new Error('Clé API Groq non configurée');
    }

    const groq = new Groq({ 
      apiKey: config.groq.apiKey 
    });

    try {
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: config.groq.model,
        language: 'fr',
        response_format: 'verbose_json'
      });

      return this.formatTranscription(transcription);
    } catch (error) {
      console.error('Erreur Groq:', error);
      throw new Error(`Erreur de transcription: ${error.message}`);
    }
  },

  formatTranscription(data) {
    if (!data || !data.segments) {
      return '';
    }

    let formattedText = '';
    for (const segment of data.segments) {
      formattedText += segment.text + '\n';
    }

    return formattedText.trim();
  }
};

export default groqService; 