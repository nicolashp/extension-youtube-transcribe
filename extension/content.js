const BACKEND_URL = 'https://extension-youtube-transcribe.onrender.com/api';

class TranscriptionButton {
  constructor(videoElement) {
    this.videoElement = videoElement;
    this.videoId = this.extractVideoId();
    this.button = this.createButton();
    this.status = this.createStatus();
  }

  extractVideoId() {
    // Essayer d'abord de trouver l'ID via l'attribut video-id
    const videoIdAttr = this.videoElement.querySelector('[href*="watch?v="]');
    if (videoIdAttr) {
      const href = videoIdAttr.getAttribute('href');
      const match = href.match(/[?&]v=([^&]+)/);
      if (match) {
        return match[1];
      }
    }

    // Essayer de trouver via le lien de la miniature
    const thumbnailLink = this.videoElement.querySelector('a#thumbnail[href], a#video-title-link[href]');
    if (thumbnailLink) {
      const href = thumbnailLink.getAttribute('href');
      if (href) {
        // Format: ?v=VIDEO_ID
        const vMatch = href.match(/[?&]v=([^&]+)/);
        if (vMatch) {
          return vMatch[1];
        }
        
        // Format: /watch/VIDEO_ID
        const watchMatch = href.match(/\/watch\/([^/?]+)/);
        if (watchMatch) {
          return watchMatch[1];
        }
        
        // Format: /video/VIDEO_ID
        const videoMatch = href.match(/\/video\/([^/?]+)/);
        if (videoMatch) {
          return videoMatch[1];
        }
      }
    }

    // Essayer de trouver via l'URL de la miniature
    const thumbnailImg = this.videoElement.querySelector('img.yt-core-image');
    if (thumbnailImg) {
      const src = thumbnailImg.getAttribute('src') || thumbnailImg.getAttribute('data-thumb');
      if (src) {
        const match = src.match(/\/vi\/([^/]+)\//);
        if (match) {
          return match[1];
        }
      }
    }

    console.error('Could not find video ID');
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
          'Origin': window.location.origin,
          'Accept': 'application/json'
        },
        credentials: 'include',
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
    const titleElement = this.videoElement.querySelector('#video-title, #video-title-link');
    if (titleElement) {
      titleElement.parentNode.insertBefore(this.button, titleElement.nextSibling);
      titleElement.parentNode.insertBefore(this.status, this.button.nextSibling);
    }
  }
}

function initializeTranscriptionButtons() {
  // Sélecteur plus spécifique pour les éléments vidéo
  const videoElements = document.querySelectorAll('ytd-rich-grid-media, ytd-grid-video-renderer');
  videoElements.forEach(videoElement => {
    // Vérifier si l'élément a déjà un bouton
    if (!videoElement.querySelector('.transcribe-button')) {
      const button = new TranscriptionButton(videoElement);
      button.inject();
    }
  });
}

// Améliorer l'observer pour éviter les doublons
const observer = new MutationObserver((mutations) => {
  let shouldInit = false;
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      const hasNewVideos = Array.from(mutation.addedNodes).some(node => 
        node.nodeName === 'YTD-RICH-GRID-MEDIA' || 
        node.nodeName === 'YTD-GRID-VIDEO-RENDERER'
      );
      if (hasNewVideos) {
        shouldInit = true;
        break;
      }
    }
  }
  if (shouldInit) {
    initializeTranscriptionButtons();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Attendre que la page soit complètement chargée
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTranscriptionButtons);
} else {
  initializeTranscriptionButtons();
} 