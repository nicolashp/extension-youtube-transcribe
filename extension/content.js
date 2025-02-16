const BACKEND_URL = 'https://youtube-transcribe-backend.onrender.com/api';

class TranscriptionButton {
  constructor(videoElement) {
    this.videoElement = videoElement;
    this.videoId = this.extractVideoId();
    this.button = this.createButton();
    this.status = this.createStatus();
  }

  extractVideoId() {
    const thumbnail = this.videoElement.querySelector('#thumbnail');
    if (thumbnail) {
      const href = thumbnail.getAttribute('href');
      return href.split('=')[1];
    }
    return null;
  }

  createButton() {
    const button = document.createElement('button');
    button.className = 'transcribe-button';
    button.textContent = 'Transcrire';
    button.addEventListener('click', () => this.handleTranscription());
    return button;
  }

  createStatus() {
    const status = document.createElement('span');
    status.className = 'transcribe-status';
    return status;
  }

  async handleTranscription() {
    if (!this.videoId) {
      this.updateStatus('Erreur: ID vidéo non trouvé', true);
      return;
    }

    this.button.disabled = true;
    this.button.classList.add('loading');
    this.updateStatus('Transcription en cours...');

    try {
      const response = await fetch(`${BACKEND_URL}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId: this.videoId })
      });

      const data = await response.json();

      if (data.success) {
        this.updateStatus(`Transcription terminée! <a href="${data.fileUrl}" target="_blank">Voir le document</a>`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      this.updateStatus(`Erreur: ${error.message}`, true);
    } finally {
      this.button.disabled = false;
      this.button.classList.remove('loading');
    }
  }

  updateStatus(message, isError = false) {
    this.status.innerHTML = message;
    this.status.style.color = isError ? '#ff0000' : '#666';
  }

  inject() {
    const titleElement = this.videoElement.querySelector('#video-title');
    if (titleElement) {
      titleElement.parentNode.insertBefore(this.button, titleElement.nextSibling);
      titleElement.parentNode.insertBefore(this.status, this.button.nextSibling);
    }
  }
}

function initializeTranscriptionButtons() {
  const videoElements = document.querySelectorAll('ytd-rich-grid-media');
  videoElements.forEach(videoElement => {
    const button = new TranscriptionButton(videoElement);
    button.inject();
  });
}

// Observer pour les chargements dynamiques
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      initializeTranscriptionButtons();
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initialisation initiale
initializeTranscriptionButtons(); 