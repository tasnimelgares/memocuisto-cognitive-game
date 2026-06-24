import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { Subscription } from 'rxjs';
import { Router } from '@angular/router'; 
import { GameSessionService } from 'src/services/game-session.service'; 
import { ConfigService } from 'src/services/config.service'; 
import { GameConfig } from 'src/models/game-config.model';
import { Ingredient } from 'src/models/ingredient.model';
import { StatsService } from 'src/services/stats.service';
import { EncouragementTextComponent } from 'src/app/shared/encouragement-text/encouragement-text.component';
import { CdkDragDrop, CdkDragMove, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

export interface PlayableItem extends Ingredient {
  stored: boolean;
  highlighted?: boolean;
  validZones: ('frais' | 'sec' | 'surgele')[];
  droppedZone?: 'frais' | 'sec' | 'surgele';
}

@Component({
  selector: 'app-kitchen-section',
  templateUrl: './kitchen-section.component.html',
  styleUrls: ['./kitchen-section.component.scss']
})
export class KitchenSectionComponent implements OnInit, OnDestroy {

  feedbackMessage: string = '';
  feedbackColor: string = '#d4edda'; 
  feedbackVoiceId: string = '';
  hintMessage: string = ''; 
  isVictorious: boolean = false; 
  tempsEcouleTotal: number = 0;
  encouragementAudio: boolean = true;
  isEntering: boolean = false;

  hoverFrais: boolean = false;
  hoverSec: boolean = false;
  hoverSurgele: boolean = false;
  hoverInvalide: boolean = false;

  aidePlacardHighlight: boolean = false;
  aideFrigoHighlight: boolean = false;
  aideCongelateurHighlight: boolean = false;

  itemsSurTable: PlayableItem[] = [];
  itemsFrais: PlayableItem[] = [];
  itemsSec: PlayableItem[] = [];
  itemsSurgele: PlayableItem[] = [];
  itemsInvalide: PlayableItem[] = [];
  
  totalItemsCount: number = 0;

  nextPage: string = '/step3';

  gameConfig!: GameConfig;
  private configSub!: Subscription;

  constructor(
    private gameSession: GameSessionService,
    private configService: ConfigService,
    private statsSession: StatsService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.isEntering = true;
    setTimeout(() => {
      this.isEntering = false;
    }, 5000);
    this.configSub = this.configService.config$.subscribe(config => {
      this.gameConfig = config;
    });

    this.encouragementAudio = this.gameSession.getIsSoloMode();

    const inventory = this.gameSession.getInventory();
    this.totalItemsCount = inventory.length;

    this.itemsSurTable = inventory.map(ing => {
      let zones: ('frais' | 'sec' | 'surgele')[] = ['sec']; 

      if (ing.zoneStockage === 'frais-sec') {
        zones = ['frais', 'sec'];
      } else if (ing.zoneStockage) {
        zones = [ing.zoneStockage as 'frais' | 'sec' | 'surgele'];
      }

      return {
        ...ing,
        stored: false,
        highlighted: false,
        validZones: zones
      };
    });

    if (this.gameSession.getIsSoloMode() == false){
      this.nextPage = "/guess-recipe";
    }
  }

  ngOnDestroy(): void {
    if (this.configSub) {
      this.configSub.unsubscribe();
    }
    this.gameSession.enregistrerTempsEtape(2, this.tempsEcouleTotal);
  }

  mettreAJourTemps(temps: number): void {
    this.tempsEcouleTotal = temps;
  }

  // --- AIDES ---
  gererAides(tempsEcoule: number) {
    if (this.isVictorious) return; 
    if (!this.gameConfig.helpEnabled || !this.gameSession.getIsSoloMode()) return;
    const timings = this.gameConfig.timingsAides;

    if (tempsEcoule === timings[0]) this.aideSimple();
    if (tempsEcoule === timings[1]) this.aideMoyenne();
    if (tempsEcoule === timings[2]) this.aideForte();
    if (tempsEcoule === timings[3]) this.aideComplete();
  }

  private getFirstUnstoredItem(): PlayableItem | undefined {
    return this.itemsSurTable.length > 0 ? this.itemsSurTable[0] : undefined;
  }

  aideSimple(): void {
    const target = this.getFirstUnstoredItem();
    if (!target) return;
  
    target.highlighted = true;
    this.gameSession.enregistrerAide(2, 'Aide Simple');
  
    if (target.validZones.includes('frais') && target.validZones.includes('sec')) {
      this.aideFrigoHighlight = true;
      this.aidePlacardHighlight = true;
      this.hintMessage = `💡 ${target.name} peut aller au frigo OU au placard.`;
    } 
    else if (target.validZones.includes('sec')) {
      this.aidePlacardHighlight = true;
      this.hintMessage = `💡 ${target.name} va au placard.`;
    } 
    else if (target.validZones.includes('surgele')) {
      this.aideCongelateurHighlight = true;
      this.hintMessage = `💡 ${target.name} va au congélateur.`;
    } 
    else {
      this.aideFrigoHighlight = true;
      this.hintMessage = `💡 ${target.name} va au frigo.`;
    }
  }

  aideMoyenne(): void {
    const target = this.getFirstUnstoredItem();
    if (target) {
      this.validerObjetAutomatiquement(target.id);
      
      const zoneCible = target.validZones[0];
      const nomZone = zoneCible === 'sec' ? 'placard' : (zoneCible === 'surgele' ? 'congélateur' : 'frigo');
      
      this.hintMessage = `💡 ${target.name} a été rangé au ${nomZone}.`;
      this.gameSession.enregistrerAide(2, 'Aide Moyenne');
    }
  }

  aideForte(): void {
    const target = this.getFirstUnstoredItem();
    if (target) {
      this.validerObjetAutomatiquement(target.id);
      
      const zoneCible = target.validZones[0];
      const nomZone = zoneCible === 'sec' ? 'placard' : (zoneCible === 'surgele' ? 'congélateur' : 'frigo');

      this.hintMessage = `💡 ${target.name} a été rangé au ${nomZone}.`;
      this.gameSession.enregistrerAide(2, 'Aide Forte');
    }
  }

  aideComplete(): void {
    const itemsRestants = [...this.itemsSurTable];
    itemsRestants.forEach(item => {
      this.validerObjetAutomatiquement(item.id);
    });

    this.feedbackMessage = "Tous les ingrédients ont été rangés !";
    this.feedbackColor = "var(--couleur-info)";
    this.isVictorious = true;
    this.gameSession.enregistrerAide(2, 'Réponse Entière');
  }

  private validerObjetAutomatiquement(id: string): void {
    const index = this.itemsSurTable.findIndex(i => i.id === id);
    if (index !== -1) {
      const item = this.itemsSurTable[index];
      this.gameSession.enregistrerActionE2(item.id, 0, true);
      item.stored = true;
      
      const zoneCible = item.validZones[0];
      item.droppedZone = zoneCible;

      // Déplacement automatique de l'élément dans le bon tableau
      const listeCible = zoneCible === 'frais' ? this.itemsFrais 
                       : zoneCible === 'sec' ? this.itemsSec 
                       : this.itemsSurgele;

      transferArrayItem(this.itemsSurTable, listeCible, index, listeCible.length);
      this.checkVictory();
    }
  }

  // --- MESSAGES ET VERIFICATIONS ---
  private succesRangement = [
    "C'est parfait "+this.configService.getPatientNickname()+", on peut ranger ça ici!",
    "Excellent "+this.configService.getPatientNickname()+", bien rangé !",
    "C'est exactement là qu'il va !",
    "Super "+this.configService.getPatientNickname()+" ! Un ingrédient de moins sur la table !",
    "Parfait "+this.configService.getPatientNickname()+", vous avez trouvé la bonne place !"
  ];

  private erreurRangement = [
    "Cet ingrédient pourrait aller à un autre endroit, réessayons !",
    "Pas tout à fait "+this.configService.getPatientNickname()+", essayons une autre zone !",
    "Voyons voir... Est-ce qu'il ne serait pas mieux ailleurs ?",
    "Ce n'est pas grave "+this.configService.getPatientNickname()+", prenons le temps de chercher la bonne place !",
    "Regardez s'il ne va pas dans une autre zone."
  ];

  private checkVictory(): void {
    if (this.itemsSurTable.length === 0) {
      console.log(`[Etape 2] Victoire ! Le total des objets (${this.totalItemsCount}) est envoyé au service.`);
      if (this.gameConfig.modeMalvoyant) this.feedbackVoiceId = 'success_rangement';
      this.feedbackMessage = "Bravo ! Vous avez tous rangé !";
      this.feedbackColor = "var(--couleur-succes)";
      this.isVictorious = true; 
      this.gameSession.enregistrerScoreEtape2(this.totalItemsCount);
    }
  }

  // --- DRAG & DROP AVEC CDK ---
  onDragStarted(): void {
    console.log(`[Etape 2] Le joueur attrape un objet.`);
    this.gameSession.resetDistanceReelleE2();
  }

  onDragMoved(event: CdkDragMove): void {
    if (this.isVictorious) return;
    
    // CDK event.delta contient le mouvement relatif de X et Y par rapport à la frame précédente
    const dx = event.delta.x; 
    const dy = event.delta.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.gameSession.ajouterDistanceReelleE2(distance);
    }
  }

  // Gestion du style visuel au survol
  zoneEntered(zone: 'frais' | 'sec' | 'surgele' | 'invalide'): void {
    if (zone === 'frais') this.hoverFrais = true;
    if (zone === 'sec') this.hoverSec = true;
    if (zone === 'surgele') this.hoverSurgele = true;
    if (zone === 'invalide') this.hoverInvalide = true;
  }

  zoneExited(zone: 'frais' | 'sec' | 'surgele' | 'invalide'): void {
    if (zone === 'frais') this.hoverFrais = false;
    if (zone === 'sec') this.hoverSec = false;
    if (zone === 'surgele') this.hoverSurgele = false;
    if (zone === 'invalide') this.hoverInvalide = false;
  }

  drop(event: CdkDragDrop<PlayableItem[]>, zoneType: 'frais' | 'sec' | 'surgele' | 'invalide' | 'table'): void {
    
    // Remise à zéro des états de survol
    this.hoverFrais = false;
    this.hoverSec = false;
    this.hoverSurgele = false;
    this.hoverInvalide = false;

    // Si on réorganise la table
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const draggedItem = event.previousContainer.data[event.previousIndex];

    if (zoneType === 'invalide') {
      if (this.gameConfig.modeMalvoyant){
          this.feedbackVoiceId = 'error';
      }
      this.feedbackMessage = "Essayez de ranger l'ingrédient au frigo, au placard ou au congélateur !";
      this.feedbackColor = "var(--couleur-erreur)";

      setTimeout(() => {
          this.feedbackMessage = '';
      }, 3000);
      return; 
      // Le CDK renverra automatiquement l'objet sur la table
    }

    if (zoneType !== 'table' && draggedItem.validZones.includes(zoneType)) {
      // Calcul de la ligne droite parfaite avec le paramètre de distance de l'event originel
      const dx = event.distance.x;
      const dy = event.distance.y;
      const distanceDirecte = Math.sqrt(dx * dx + dy * dy);
      
      console.log(`[Etape 2] Objet lâché au BON endroit (${zoneType}). Ligne droite parfaite : ${Math.round(distanceDirecte)}px`);
      this.gameSession.enregistrerActionE2(draggedItem.id, distanceDirecte, false);

      draggedItem.stored = true;
      draggedItem.droppedZone = zoneType;
      draggedItem.highlighted = false;

      if (this.gameConfig.plusEncouragements){
        this.feedbackMessage = EncouragementTextComponent.obtenirMessageAleatoire(this.succesRangement);
      } else {
        if (this.gameConfig.modeMalvoyant){
          this.feedbackVoiceId = 'success';
        }
        this.feedbackMessage = "Bien joué !";
      }
      this.feedbackColor = "var(--couleur-succes)";
      this.hintMessage = '';

      // Transfert officiel entre le tableau "table" et le tableau de la zone validée
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.checkVictory();

      // On efface le message si on n'a pas encore gagné
      setTimeout(() => {
        if (!this.isVictorious) {
          this.feedbackMessage = '';
        }
      }, 3000);

    } else {
      console.log(`[Etape 2] Objet lâché au MAUVAIS endroit (${zoneType} au lieu de ${draggedItem.validZones.join(' ou ')})`);
      if (this.gameConfig.plusEncouragements){
        this.feedbackMessage = EncouragementTextComponent.obtenirMessageAleatoire(this.erreurRangement);
      } else {
        if (this.gameConfig.modeMalvoyant){
          this.feedbackVoiceId = 'error';
        }
        this.feedbackMessage = "Ce n'est pas le bon endroit, réessayez !";
      }
      this.feedbackColor = "var(--couleur-erreur)";
      this.gameSession.enregistrerActionE2(draggedItem.id, 0, true);
      // On efface le message si on n'a pas encore gagné
      setTimeout(() => {
          this.feedbackMessage = '';
      }, 3000);
    }
  }

  // --- NAVIGATION ---
  allerALaSuite(): void {
    this.router.navigate([this.nextPage]);
  }

}