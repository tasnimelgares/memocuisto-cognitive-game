import { Component, ChangeDetectorRef } from '@angular/core';
import { ConfigService } from 'src/services/config.service';

@Component({
  selector: 'app-voice-settings',
  templateUrl: './voice-settings.component.html',
  styleUrl: './voice-settings.component.scss'
})
export class VoiceSettingsComponent {
  mediaRecorder: any;
  audioChunks: any[] = [];
  
  modeMalvoyant: boolean = false;
  selectedVoice: string = 'feminine';
  useCustomVoice: boolean = false;
  
  // Nouvelle variable pour gérer l'affichage du formulaire d'enregistrement
  showNewRecordingForm: boolean = false;

  phrases = [
    // --- ÉTAPES & CONSIGNES ---
    { id: 'rayon', label: 'Au supermarché', texte: 'Dans quels rayons se trouvent tes ingrédients ? Clique dessus !', recording: false, recorded: false },
    { id: 'supermarche', label: 'Dans le magasin', texte: 'Nous sommes dans le supermarché, clique sur les ingrédients mémorisés', recording: false, recorded: false },
    { id: 'rangement', label: 'Rangement cuisine', texte: 'Range les courses au bon endroit !', recording: false, recorded: false },
    { id: 'etapes', label: 'Préparation', texte: "Clique sur les étapes dans l'ordre de la recette", recording: false, recorded: false },
    
    // --- FÉLICITATIONS / VICTOIRE ---
    { id: 'success_courses', label: 'Victoire Courses', texte: 'Félicitations tu as bien retrouvé les ingrédients', recording: false, recorded: false },
    { id: 'success_rangement', label: 'Victoire Rangement', texte: 'Félicitations tu as bien rangé les ingrédients', recording: false, recorded: false },
    { id: 'success_final', label: 'Fin de partie', texte: 'Félicitations tu as très bien joué', recording: false, recorded: false },
    
    // --- FEEDBACKS RAPIDES ---
    { id: 'success', label: 'En cas de réussite', texte: 'Bravo, c\'est exactement ça !', recording: false, recorded: false },
    { id: 'help', label: 'En cas d\'indice donné', texte: 'Nous t\'avons donné un indice pour t\'aider !', recording: false, recorded: false },
    { id: 'encouragement', label: 'Pour encourager', texte: 'Essaie encore, tu vas y arriver !', recording: false, recorded: false },
    { id: 'error', label: 'En cas d\'erreur', texte: 'Oups, essayons autre chose.', recording: false, recorded: false }
  ];

  constructor(
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.configService.config$.subscribe(config => {
      this.selectedVoice = config.typeVoix;
      this.modeMalvoyant = config.modeMalvoyant;
      this.useCustomVoice = (config.typeVoix === 'proche');
      
      this.phrases.forEach(p => {
        if (config.audios && config.audios[p.id]) p.recorded = true;
      });
    });
  }

  // --- GETTERS POUR SEPARER LES LISTES ---
  get recordedPhrases() {
    return this.phrases.filter(p => p.recorded);
  }

  get unrecordedPhrases() {
    return this.phrases.filter(p => !p.recorded);
  }

  // --- GESTION DES MODES ---
  toggleModeMalvoyant() {
    this.modeMalvoyant = !this.modeMalvoyant;
    this.configService.updateConfig({ modeMalvoyant: this.modeMalvoyant });
  }

  selectVoice(voice: 'feminine' | 'masculine') {
    this.useCustomVoice = false;
    this.selectedVoice = voice;
    this.configService.updateConfig({ typeVoix: voice });
  }

  selectCustomVoice() {
    this.useCustomVoice = true;
    this.selectedVoice = 'proche';
    this.configService.updateConfig({ typeVoix: 'proche' });
  }

  // --- GESTION AUDIO ---
  async toggleRecording(phrase: any) {
    if (!phrase.recording) {
      await this.startRecord(phrase);
    } else {
      this.stopRecord(phrase);
      phrase.recorded = true;
    }
  }

  async startRecord(phrase: any) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e: any) => this.audioChunks.push(e.data);
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        
        reader.onloadend = () => {
          this.saveAudio(phrase.id, reader.result as string);
          phrase.recorded = true;
          this.cdr.detectChanges();
        };
      };
      this.mediaRecorder.start();
      phrase.recording = true;
    } catch (err) {
      console.error("Erreur micro : ", err);
      alert("Impossible d'accéder au micro.");
    }
  }

  stopRecord(phrase: any) {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      phrase.recording = false;
    }
  }

  saveAudio(id: string, base64Data: string) {
    const config = this.configService.getCurrentConfig();
    const currentAudios = config.audios || {};
    const newAudios = { ...currentAudios, [id]: base64Data };

    this.configService.updateConfig({ 
      typeVoix: 'proche', 
      audios: newAudios
    });
  }

  deleteRecording(phrase: any) {
    phrase.recorded = false;
    const config = this.configService.getCurrentConfig();
    if (config.audios) {
      delete config.audios[phrase.id];
      this.configService.updateConfig({ audios: config.audios });
    } 
    this.cdr.detectChanges();
  }

  // Permet d'écouter la piste sauvegardée
  playAudio(phrase: any) {
    const config = this.configService.getCurrentConfig();
    const audioBase64 = config.audios[phrase.id];
    if (audioBase64) {
      const audio = new Audio(audioBase64);
      audio.play();
    }
  }
}