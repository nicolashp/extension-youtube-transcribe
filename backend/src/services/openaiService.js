import OpenAI from 'openai';
import config from '../config/config.js';

const openaiService = {
  client: new OpenAI({
    apiKey: config.openai.apiKey,
    baseURL: config.openai.baseUrl
  }),

  async improveTranscription(transcription) {
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            "role": "system",
            "content": "Tu es un expert en amélioration de transcriptions audio. Ta tâche est de corriger et d'améliorer la fluidité des transcriptions, tout en conservant strictement toutes les informations, chiffres, concepts et tournures de phrases du texte original."
          },
          {
            "role": "user",
            "content": `Voici la transcription complète d'un podcast. Certains passages sont parfois lacunaires ou maladroitement formulés. Peux-tu réécrire cette transcription pour la rendre plus fluide et naturelle, en conservant l'intégralité du contenu original (tous les chiffres, informations, et tournures de phrases)

Transcription :
${transcription}`
          }
        ],
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || transcription;
    } catch (error) {
      console.error('Erreur lors de l\'amélioration de la transcription:', error);
      return transcription; // En cas d'erreur, retourner la transcription originale
    }
  }
};

export default openaiService; 