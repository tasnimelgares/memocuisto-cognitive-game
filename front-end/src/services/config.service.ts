import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameConfig, GameTheme } from 'src/models/game-config.model'; 
import { PatientService } from './patient.service';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from '../configs/server.config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  // toggle l'affichage pour debugger
  private DEBUG = false;
  // pour les requêtes serveur
  private readonly API_URL = serverUrl + '/patients/'
  private currentPatientNickname = "";

  // config de base pour les nouveaux patients
  private defaultConfig: GameConfig = {
    plusEncouragements: false,
    isLargeMode: false,
    modeMalvoyant: false,
    enleverTexteEchec: false,
    popupInactivite: false,

    difficulte: 'facile',
    maxIngredientsParRayon: 100,
    budgetActif: false,
    budgetMax: 20,
    tempsEtape1: 'illimite',
    tempsEtape2: 'illimite',
    tempsEtape3: 'illimite',

    helpEnabled: false,
    timingsAides: [25, 45, 55, 75], 

    typeVoix: 'feminine',
    audios: {},

    roleplayActif: false,
    personnaliseActif: false,

    theme:{ name: 'Couleur par défaut', hex: '', isDefault: true, isDark: false }
  };

  // config du patient actuel
  private configSubject = new BehaviorSubject<GameConfig>(this.defaultConfig);
  public config$ = this.configSubject.asObservable();

  constructor(private patientService: PatientService, private http: HttpClient) {

    // on syncronise la config actuelle avec le patient actuel
    this.patientService.currentPatient$.subscribe(patient => {
      if (patient) {
        this.loadConfigForPatient(patient.id!);
        this.currentPatientNickname = patient.nickname ? patient.nickname : "";
        if (this.DEBUG){
          console.log("config actuel liés au patient :",patient);
        }
      } else {
        this.resetConfig();
        if (this.DEBUG){
          console.log("config par défaut car aucun current patient");
        }
      }
    });
  }

  // récupère la config propre au patient actuel
  private loadConfigForPatient(patientId: number): void {
  this.http.get<GameConfig>(`${this.API_URL}${patientId}/configs`)
    .subscribe({
      next: (config) => {
        if (!config) {
            const defaultConfig = { ...this.defaultConfig, patientId };
            this.configSubject.next(defaultConfig);
            this.applyVisuals(defaultConfig);
            if (this.DEBUG) console.log("Patient sans config : application de la config par défaut");
            return; 
          }
        this.configSubject.next(config);
        if (this.DEBUG) console.log("configs du serveur reçues :",config);
        this.applyVisuals(config);
      },
      error: () => {
        // Si le patient n'a pas encore de config en base, on utilise le défaut
        const defaultConfig = { ...this.defaultConfig, patientId };
        if (this.DEBUG) console.log("configs du serveur non reçues donc configs par défaut :");
        this.configSubject.next(defaultConfig);
      }
    });
}

  // modifie la config d'un patient spécifique via son ID
  updateConfig(nouvellesValeurs: Partial<GameConfig>): void {
    const currentPatient = this.patientService.currentPatient$.getValue();
    if (!currentPatient || !currentPatient.id) return;

    const updatedConfig = { ...this.configSubject.getValue(), ...nouvellesValeurs };

    // On envoie la mise à jour au serveur
    // Si la config a déjà un ID, on fait un PUT, sinon on pourrait faire un POST
    // Ici, on part du principe que ton back gère le lien via le patientId
    this.http.put<GameConfig>(`${this.API_URL}${currentPatient.id}/configs`, updatedConfig)
      .subscribe({
        next: (res) => {
          this.configSubject.next(res);
          this.applyVisuals(res);
          if (this.DEBUG) console.log("Config sauvegardée avec succès", res);
        },
        error: (err) => console.error("Erreur lors de la sauvegarde", err)
      });
  }

  getCurrentConfig(): GameConfig {
    if (this.DEBUG){
      console.log("config actuelles envoyées :",this.configSubject.getValue());
    }
    return this.configSubject.getValue();
    
  }

  // affichage
  private applyVisuals(config: GameConfig): void {
    this.applyLargeModeToBody(config.isLargeMode);
    this.applyThemeToBody(config.theme);
    this.applyToggleCouleurEchec(config.enleverTexteEchec);
  }

  public getPatientNickname():string{
    return this.currentPatientNickname;
  }

  private applyLargeModeToBody(value: boolean): void {
    if (value) {
      document.body.classList.add('large-mode');
      if (this.DEBUG){
        console.log("mode large activé ");
      }
    } else {
      document.body.classList.remove('large-mode');
      if (this.DEBUG){
        console.log("mode large désactivé");
      }
    }
  }

  private applyToggleCouleurEchec(value:boolean) {
    if (value){
      document.documentElement.style.setProperty('--couleur-erreur', '#8a2be2');
      document.documentElement.style.setProperty('--couleur-aide', '#462be2');
    } 
    else {
      document.documentElement.style.setProperty('--couleur-erreur','#dc3545');
      document.documentElement.style.setProperty('--couleur-aide','#ffc107');
    }
  }

  private applyThemeToBody(theme: GameTheme): void {
  if (theme.isDefault || !theme.hex) {
    document.documentElement.style.removeProperty('--main-bg');
    document.documentElement.style.removeProperty('--title-color');
  } else {
    document.documentElement.style.setProperty('--main-bg', theme.hex);
    document.documentElement.style.setProperty('--title-color', theme.isDark ? '#ffffff' : '#2c3e50');
  }
}

  resetConfig() {
    this.configSubject.next(this.defaultConfig);
    this.applyVisuals(this.defaultConfig);
  }
}