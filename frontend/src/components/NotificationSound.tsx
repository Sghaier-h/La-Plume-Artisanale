/**
 * NotificationSound - Service pour jouer des sons de notification
 */

class NotificationSoundService {
  private audioContext: AudioContext | null = null;
  private notificationSound: HTMLAudioElement | null = null;

  constructor() {
    // Créer un contexte audio si disponible
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('AudioContext non disponible:', error);
      }
    }

    // Charger le son de notification
    this.loadNotificationSound();
  }

  private loadNotificationSound() {
    // Créer un son de notification simple (bip WhatsApp)
    if (typeof window !== 'undefined') {
      this.notificationSound = new Audio();
      // Générer un son de notification simple
      this.generateNotificationSound();
    }
  }

  private generateNotificationSound() {
    if (!this.audioContext || !this.notificationSound) return;

    try {
      // Générer un son de bip WhatsApp simple
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Premier ton (aigu - 800Hz)
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
      
      // Deuxième ton (plus grave - 600Hz)
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);

      // Utiliser un fichier audio simple pour la notification
      // En production, utilisez un fichier audio réel
      const audioDataUrl = this.generateSimpleBeepAudio();
      this.notificationSound.src = audioDataUrl;
    } catch (error) {
      console.warn('Erreur génération son:', error);
      // Fallback: utiliser un fichier audio si disponible
      this.notificationSound.src = '/sounds/whatsapp-notification.mp3';
    }
  }

  private generateSimpleBeepAudio(): string {
    // Générer un data URL simple pour un bip
    // En production, utilisez un fichier audio réel
    // Pour l'instant, retourner une URL vide qui utilisera un fichier audio
    return '/sounds/whatsapp-notification.mp3';
  }

  play() {
    if (this.notificationSound) {
      this.notificationSound.play().catch(error => {
        console.warn('Erreur lecture son notification:', error);
      });
    }
  }

  playWebNotification(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        ...options,
        icon: '/whatsapp-icon.png', // Icône WhatsApp
        badge: '/whatsapp-icon.png'
      });

      // Jouer le son
      this.play();

      // Fermer automatiquement après 5 secondes
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // Demander la permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.playWebNotification(title, options);
        }
      });
    }
  }
}

export const notificationSound = new NotificationSoundService();
