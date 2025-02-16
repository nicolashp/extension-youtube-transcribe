import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';
import config from '../config/config.js';

const gladiaService = {
  async transcribe(audioFilePath) {
    const form = new FormData();
    form.append('audio', fs.createReadStream(audioFilePath));
    form.append('language_behaviour', 'automatic single language');
    form.append('diarization', 'true');

    const response = await fetch(config.gladia.apiUrl, {
      method: 'POST',
      headers: {
        'x-gladia-key': config.gladia.apiKey,
        ...form.getHeaders()
      },
      body: form
    });

    if (!response.ok) {
      throw new Error(`Erreur Gladia: ${response.statusText}`);
    }

    const data = await response.json();
    return this.formatTranscription(data);
  },

  formatTranscription(data) {
    let formattedText = '';
    const transcription = data.prediction || [];

    let currentSpeaker = null;
    for (const segment of transcription) {
      if (segment.speaker !== currentSpeaker) {
        currentSpeaker = segment.speaker;
        formattedText += `\n\nSpeaker ${currentSpeaker}:\n`;
      }
      formattedText += segment.transcription + ' ';
    }

    return formattedText.trim();
  }
};

export default gladiaService; 