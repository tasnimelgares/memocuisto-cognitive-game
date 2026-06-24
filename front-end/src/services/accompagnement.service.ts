import { Injectable, NgZone } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AccompagnementService {

    private DEBUG = true;
  
  public afficherPopup: boolean = false;

  private isPopupActive: boolean = false;
  private timeoutId: any;
  private readonly INACTIVITY_TIME = 20000; // 20 secondes

  constructor(
    private configService: ConfigService,
    private ngZone: NgZone
  ) {
    this.configService.config$.subscribe(config => {
      this.isPopupActive = config.popupInactivite;
      if (this.DEBUG) {
        console.log(`[DEBUG Accompagnement] 📥 Config reçue ! popupInactivite = ${this.isPopupActive}`);
      }
      
      if (this.isPopupActive) {
        this.startWatchingInactivity();
      } else {
        this.stopWatchingInactivity();
      }
    });
  }

  private startWatchingInactivity() {
    if (this.DEBUG) console.log(`[DEBUG Accompagnement] ⏱️ Démarrage du minuteur (${this.INACTIVITY_TIME / 1000} secondes)...`);
    this.setupEvents();
    this.resetTimer();
  }

  private stopWatchingInactivity() {
    if (this.DEBUG && this.timeoutId) console.log("[DEBUG Accompagnement] 🛑 Arrêt du minuteur d'inactivité.");
    this.removeEvents();
    clearTimeout(this.timeoutId);
    this.afficherPopup = false;
  }

  private setupEvents() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.resetTimer.bind(this));
      window.addEventListener('click', this.resetTimer.bind(this));
      window.addEventListener('touchstart', this.resetTimer.bind(this));
    });
  }

  private removeEvents() {
    window.removeEventListener('mousemove', this.resetTimer.bind(this));
    window.removeEventListener('click', this.resetTimer.bind(this));
    window.removeEventListener('touchstart', this.resetTimer.bind(this));
  }

  public resetTimer() {
    if (!this.isPopupActive) return;

    clearTimeout(this.timeoutId);
    
    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
        if (this.DEBUG) console.log("[DEBUG Accompagnement] 🔔 Temps d'inactivité écoulé ! On affiche le popup.");
          this.afficherPopup = true;
        });
      }, this.INACTIVITY_TIME);
    });
  }

  // Fonction appelée quand le joueur clique sur le bouton pour continuer
  public fermerPopup() {
    if (this.DEBUG) console.log("[DEBUG Accompagnement] ✅ Le joueur a cliqué sur continuer. On ferme le popup et on relance le minuteur.");
    this.afficherPopup = false;
    this.resetTimer();
  }
}