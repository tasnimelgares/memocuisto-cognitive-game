import { Component, Input } from '@angular/core';
import { ConfigService } from 'src/services/config.service';

@Component({
  selector: 'app-encouragement-text', 
  templateUrl: './encouragement-text.component.html',
  styleUrl: './encouragement-text.component.scss'
})
export class EncouragementTextComponent {
  DEBUG: boolean = true;

  @Input() text: string = '';
  @Input() color: string = '#27ae60'; 
  @Input() phraseId: string = ''; // id pour retrouver l'audio
  @Input() autoPlay: boolean = true;
  @Input() delay: number = 500;

  constructor(private configService: ConfigService) {}
  
  ngOnInit() {
    const config = this.configService.getCurrentConfig();
    if (config && config.modeMalvoyant && this.autoPlay) { 
      setTimeout(() => {  this.lireConsigne();}, this.delay);
    }
  }

  // Fonction utilitaire pour piocher un message au hasard
  public static obtenirMessageAleatoire(liste: string[]): string {
    const index = Math.floor(Math.random() * liste.length);
    return liste[index];
  }

  lireConsigne() {
    const config = this.configService.getCurrentConfig();
    if (this.DEBUG) console.log("voix config actuelle :",config.typeVoix);

    if (config.typeVoix === 'proche' && config.audios && config.audios[this.phraseId]) {
      this.jouerAudioEnregistre(config.audios[this.phraseId]);
    } 
    //sinon synthèse vocale classique (Homme ou Femme)
    else {
      this.lireSyntheseVocale(config.typeVoix);
    }
  }

  private jouerAudioEnregistre(base64Data: string) {
    //visuel de l'instruction : 
    const audio = new Audio(base64Data);
    audio.play();
  }

  private lireSyntheseVocale(genre: string) {
    if (!('speechSynthesis' in window)) return;

    // on récupère les voix 
    let voices = window.speechSynthesis.getVoices();

    // si la liste est vide on s'abonne à l'événement de chargement
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        // une fois que c'est chargé on relance la fonction
        this.lireSyntheseVocale(genre);
        // on nettoie l'événement pour éviter de relancer la fonction inutilement plus tard
        window.speechSynthesis.onvoiceschanged = null;
      };
      return; // on sort de la fonction en attendant l'événement
    }

    // si on arrive là les voies sont chargées
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;

    const frVoices = voices.filter(v => v.lang.includes('fr'));

    if (this.DEBUG) {
      console.log("liste des voix fr disponibles :", frVoices.map(v => v.name));
    }

    if (genre === 'masculine') {
      const maleVoice = frVoices.find(v => 
        v.name.includes('Paul') || 
        v.name.includes('Thomas') || 
        v.name.includes('Claude') || 
        v.name.includes('Google français')
      );
      // on utilise la voix trouvée, sinon la première voix FR, sinon rien (voix système)
      utterance.voice = maleVoice || frVoices[0] || null;
    } else {
      const femaleVoice = frVoices.find(v => 
        v.name.includes('Hortense') || 
        v.name.includes('Alice')
      );
      utterance.voice = femaleVoice || frVoices[0] || null;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}