import { ConfigService } from 'src/services/config.service';
import { Injectable } from '@angular/core';
import { Ingredient } from 'src/models/ingredient.model.js';
import { Recipe } from 'src/models/recipe.model';
import { RecipeService } from './recipe.service';
import { IngredientService } from './ingredient.service';
import { GameResult } from 'src/models/game-result.model';
import { MapComponent } from 'src/app/player/start-game/step1/map/map.component';

@Injectable({
  providedIn: 'root' 
})
export class GameSessionService {
  
  // --- DONNÉES DE SESSION ---
  private currentInventory: Ingredient[] = [];
  private currentRecipe: Recipe | null = null;
  private currentRayonId: string = '';
  private etageresSauvegardees: Map<string, Ingredient[]> = new Map();
  private patientName: string = '';
  private isSoloMode: boolean = true; 
  private savedTime: number = 0;
  private introSupermarcheVue: boolean = false;
  private DEBUG = false;
  
  // Pour se souvenir des choix précis du joueur quand il y a des alternatives
  private selectedAlternativeIds: string[] = []; 
 
  // --- COMPTEURS ÉTAPE 1 (Magasin) ---
  private tempsE1: number = 0;
  public scoreManuelEtape1: number = 0;
  private aidesE1: string[] = [];
  private ingredientsTrouvesSeul: number = 0; 
  private ingredientsTotal: number = 0;
  private clicsValidesE1: number = 0;
  private clicsHorsCibleE1: number = 0;

  // --- COMPTEURS ÉTAPE 2 (Cuisine) ---
  private tempsE2: number = 0;
  private aidesE2: string[] = [];
  private detailsAisanceE2: {
      objetId: string;
      reel: number;
      optimal: number;
    }[] = [];
  private distanceReelleCouranteE2: number = 0; // Se reset après chaque rangement réussi
  private objetsTotal: number =0;

  // --- COMPTEURS ÉTAPE 3 (Recette) ---
  private tempsE3: number = 0;
  private aidesE3: string[] = [];
  private etapesOrdonneesSeul: number = 0;
  private recommencementsE3: number = 0;
  private etapesTotal: number = 0;


  constructor(private recipeService: RecipeService, private ingredientService: IngredientService, private configService: ConfigService) {
    // On s'abonne à la recette sélectionnée dès que le service est créé
    this.recipeService.selectedRecipe$.subscribe(recipe => {
      this.currentRecipe = recipe;
      if (this.DEBUG) console.log("GameSessionService : Recette synchronisée !", recipe);
    });
    // On s'abonne à la liste d'ingrédients
    this.ingredientService.ingredients$.subscribe(ing => {
      this.currentInventory = ing;
      if (this.DEBUG) console.log("GameSessionService : Liste d'ingrédients synchronisée !", ing);
    });
  }
  
  // --------------------------------------------------------
  // GESTION DU PROFIL PATIENT
  // --------------------------------------------------------
  getPatientName(): string {
    return this.patientName;
  }

  setPatientName(name: string): void {
    this.patientName = name;
  }

  // --------------------------------------------------------
  // GESTION DU MODE DE JEU (Solo / Duo)
  // --------------------------------------------------------
  getIsSoloMode(): boolean {
    return this.isSoloMode;
  }

  setGameMode(isSolo: boolean): void {
    // On remet la partie à zéro avant de commencer
    this.resetGame(); 
    
    // On enregistre le mode choisi par le joueur
    this.isSoloMode = isSolo; 
  }

  // --------------------------------------------------------
  // PARTIE LECTURE 
  // --------------------------------------------------------
  
  getInventory(): Ingredient[] {
    if (!this.currentRecipe) {
      return [];
    }

    const inventoryList: Ingredient[] = [];

    this.currentRecipe.ingredientsIds.forEach((req: any) => {
      if (Array.isArray(req)) {
        const reqStrings = req.map(r => String(r)); 
        
        // On cherche d'abord si le joueur a cliqué sur un de ces ingrédients
        const specificIdFound = reqStrings.find(id => this.selectedAlternativeIds.includes(id));
        
        if (specificIdFound) {
          const item = this.currentInventory.find(i => String(i.id) === specificIdFound);
          if (item && !inventoryList.includes(item)) inventoryList.push(item);
        } else {
          // S'il n'a encore rien trouvé, on affiche le premier de la liste par défaut
          const representative = this.currentInventory.find(i => reqStrings.includes(String(i.id)));
          if (representative && !inventoryList.includes(representative)) {
            inventoryList.push(representative);
          }
        }
      } else {
        // C'est un ID classique
        const item = this.currentInventory.find(i => String(i.id) === String(req));
        if (item && !inventoryList.includes(item)) {
          inventoryList.push(item);
        }
      }
    });

    return inventoryList;
  }

  getCurrentRecipe(): Recipe | null {
    return this.currentRecipe;
  }

  // --- GESTION DES RAYONS (LES RÈGLES) ---

  // Quand le joueur clique sur un rayon dans le plan
  setCurrentRayon(rayonId: string): void {
    this.currentRayonId = rayonId;
  }

  // Pour que l'étape 1 sache quel décor afficher
  getCurrentRayon(): string {
    return this.currentRayonId;
  }

  // Récupère l'étagère telle qu'elle a été générée la première fois 
  getIngredientsEtagere(rayon: string): Ingredient[] | undefined {
    return this.etageresSauvegardees.get(rayon);
  }

  // Fige la composition de l'étagère pour ce rayon
  setIngredientsEtagere(rayon: string, ingredients: Ingredient[]): void {
    this.etageresSauvegardees.set(rayon, ingredients);
  }

  // --------------------------------------------------------
  // PARTIE ÉCRITURE
  // --------------------------------------------------------

  // --- ACTIONS DE JEU ---

  markAsFound(id: string | number): void {
    if (!this.currentRecipe) return;

    const targetId = String(id); 

    // On mémorise le choix précis du joueur pour l'utiliser à l'étape 2
    if (!this.selectedAlternativeIds.includes(targetId)) {
      this.selectedAlternativeIds.push(targetId);
    }

    // On cherche le "groupe" de cet ingrédient
    const reqGroup = this.currentRecipe.ingredientsIds.find((req: any) => {
      if (Array.isArray(req)) {
        return req.map(r => String(r)).includes(targetId);
      }
      return String(req) === targetId;
    });

    if (reqGroup) {
      // On coche tous les éléments du groupe 
      if (Array.isArray(reqGroup)) {
        reqGroup.forEach(eqId => {
          const item = this.currentInventory.find(i => String(i.id) === String(eqId));
          if (item) item.selected = true;
        });
      } else {
        const item = this.currentInventory.find(i => String(i.id) === String(reqGroup));
        if (item) item.selected = true;
      }
    }
  }

  isEverythingFound(): boolean {
    const inventory = this.getInventory();
    return inventory.length > 0 && inventory.every(item => item.selected);
  }

  
  // --------------------------------------------------------
  //  l' animation de départ :
  // --------------------------------------------------------

  // Le composant demande si l'animation a déjà été vue
  hasSeenIntro(): boolean {
    return this.introSupermarcheVue;
  }

  // Le composant prévient qu'il vient de montrer l'animation
  markIntroAsSeen(): void {
    this.introSupermarcheVue = true;
  }

  // --------------------------------------------------------
  // --- MÉMOIRE DU CHRONO ---
  // --------------------------------------------------------

  getSavedTime(): number {
    return this.savedTime;
  }

  setSavedTime(time: number): void {
    this.savedTime = time;
  }

  // Permet de remettre le jeu à zéro si le joueur recommence ou choisit une nouvelle recette
  resetGame(): void {
    if (this.currentInventory) {
      this.currentInventory.forEach(item => item.selected = false);
    }
    this.currentRecipe = null;
    this.currentRayonId = '';
    this.introSupermarcheVue = false;
    this.savedTime = 0; 
    this.scoreManuelEtape1 = 0;
    this.selectedAlternativeIds = []; 
    this.etageresSauvegardees.clear();
    
    // Reset E1
    MapComponent.dernierTempsConnu = 0;
    this.tempsE1 = 0;
    this.aidesE1 = [];
    this.ingredientsTrouvesSeul = 0;
    this.ingredientsTotal = 0;
    this.clicsValidesE1 = 0;
    this.clicsHorsCibleE1 = 0;
    // Reset E2
    this.tempsE2 = 0;
    this.aidesE2 = [];
    this.objetsTotal = 0;
    this.detailsAisanceE2 = [];
    this.distanceReelleCouranteE2 = 0;
    // Reset E3
    this.tempsE3 = 0;
    this.aidesE3 = [];
    this.etapesOrdonneesSeul = 0;
    this.etapesTotal = 0;
    this.recommencementsE3 = 0;
  }

  // --------------------------------------------------------
  // --- MÉTHODES POUR GENERER LE GAMERESULT AUX STATS ---
  // --------------------------------------------------------
  
  private isHelpEnabled(): boolean {
  return this.configService.getCurrentConfig()?.helpEnabled ?? false;
}

  ajouterClicValideE1(): void {
    this.clicsValidesE1++;
    if (this.DEBUG) console.log(" [Etape1] un clic valide");
    this.logStatsE1();// juste pour debug
  }

  ajouterClicHorsCibleE1(): void {
    this.clicsHorsCibleE1++;
    if (this.DEBUG) console.log(" [Etape1] un clic hors cible");
    this.logStatsE1();//pr debug
  }

  // temporaire
  private logStatsE1(): void {
    const total = this.clicsValidesE1 + this.clicsHorsCibleE1;
    const ratio = total > 0 ? Math.round((this.clicsValidesE1 / total) * 100) : 100;
    if (this.DEBUG) console.log(
      `[Etape1 STATS] Précision: ${ratio}% | ` +
      `Valides: ${this.clicsValidesE1} | ` +
      `Hors-Cible: ${this.clicsHorsCibleE1}`
    );
  }

  enregistrerAide(etape: 1 | 2 | 3, nomAide: string): void {
    if (!this.isHelpEnabled()) return;
    const tableau = etape === 1 ? this.aidesE1 : etape === 2 ? this.aidesE2 : this.aidesE3;
    if (!tableau.includes(nomAide)) {
      tableau.push(nomAide);
      }
    }

  enregistrerTempsEtape(etape: 1 | 2 | 3, tempsEnSecondes: number): void {
    if (etape === 1) this.tempsE1 = tempsEnSecondes;
    if (etape === 2) this.tempsE2 = tempsEnSecondes;
    if (etape === 3) this.tempsE3 = tempsEnSecondes;
    if (this.DEBUG) console.log(`[GameSession] Temps enregistré pour l'Étape ${etape} : ${tempsEnSecondes} secondes`);
  }

   

  enregistrerActionE2(objetId: string, distanceOptimale: number, estAutomatique: boolean): void {
    if (!estAutomatique && this.distanceReelleCouranteE2 > 0) {
      
      // juste pour debug :
      const ratio = Math.min(1, distanceOptimale / this.distanceReelleCouranteE2);
      const pourcentage = Math.round(ratio * 100);
      if (this.DEBUG) console.log(`📐 [Aisance Etape2] Objet: ${objetId}`);
      if (this.DEBUG) console.log(`   ➡️ Trajet Réel (avec zigzags) : ${Math.round(this.distanceReelleCouranteE2)} px`);
      if (this.DEBUG) console.log(`   ➡️ Trajet Idéal (ligne droite) : ${Math.round(distanceOptimale)} px`);
      if (this.DEBUG) console.log(`   Résultat : Aisance de ${pourcentage}% sur ce rangement !`);

      this.detailsAisanceE2.push({
        objetId,
        reel: this.distanceReelleCouranteE2,
        optimal: distanceOptimale
      });
    }
    this.distanceReelleCouranteE2 = 0;
  }

   ajouterDistanceReelleE2(pixels: number): void {
    this.distanceReelleCouranteE2 += pixels;
   }
  
  resetDistanceReelleE2(): void {
    this.distanceReelleCouranteE2 = 0;
  }

  enregistrerScoreEtape1(trouvesSansAide: number, totalIngredient: number): void {
    this.ingredientsTrouvesSeul = trouvesSansAide;
    this.ingredientsTotal = totalIngredient;
  }
  incrementerScoreManuelEtape1() {
    this.scoreManuelEtape1++;
  }

  enregistrerScoreEtape2(totalObjets: number): void {
    this.objetsTotal = totalObjets;
  }

  enregistrerScoreEtape3(ordonneesSansAide: number, totalEtapes: number): void {
    this.etapesOrdonneesSeul = ordonneesSansAide;
    this.etapesTotal = totalEtapes;
  }

  ajouterRecommencementEtape3(): void {
    this.recommencementsE3++;
  }

// on emballe toutes les données dans un GameResult pour l'envoyer au stats
  genererResultatFinal(): GameResult {
    const configDeLaPartie = this.configService.getCurrentConfig();
    const resultat: GameResult = {
      date: this.recupererDateDuJour(),
      isSoloMode: this.isSoloMode,
      config: configDeLaPartie,
      global: {
        tempsTotal: this.calculerTempsTotal(),
      },
      etape1: this.preparerStatsEtape1(),
      etape2: this.preparerStatsEtape2(),
      etape3: this.preparerStatsEtape3()
    };
    if (this.DEBUG) console.log("[GameSession] === RÉSULTAT FINAL PRÊT À ÊTRE ENVOYÉ ===", resultat);
    return resultat;
  }

  private recupererDateDuJour(): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('fr-FR', options);
  }
  private calculerTempsTotal(): number {
    return this.tempsE1 + this.tempsE2 + this.tempsE3;
  }

  private preparerStatsEtape1() {
    return {
      temps: this.tempsE1,
      ingredientsBons: this.ingredientsTrouvesSeul,
      ingredientsTotal: this.ingredientsTotal,
      aides: this.isHelpEnabled() ? this.aidesE1 : [],
      clicsValides: this.clicsValidesE1,
      clicsHorsCible: this.clicsHorsCibleE1
    };
  }
  private preparerStatsEtape2() {
    return {
      temps: this.tempsE2,
      objetsBienRanges: this.detailsAisanceE2.length,
      objetsTotal: this.objetsTotal,
      aisance: this.calculerMoyenneAisanceE2(),
      aisanceMin: this.calculerAisanceMinE2(),
      aisanceMax: this.calculerAisanceMaxE2(),
      detailsAisanceParObjet: this.formaterDetailsAisanceE2(),
      aides: this.isHelpEnabled() ? this.aidesE2 : []
    };
  }
  private calculerMoyenneAisanceE2(): number {
    if (this.detailsAisanceE2.length === 0) return 100;
    
    const sommeRatios = this.detailsAisanceE2.reduce((acc, d) => {
      return acc + Math.min(1, d.optimal / d.reel);
    }, 0);
    
    return Math.round((sommeRatios / this.detailsAisanceE2.length) * 100);
  }

  private calculerAisanceMinE2(): number {
    if (this.detailsAisanceE2.length === 0) return 100;
    const ratios = this.detailsAisanceE2.map(d => Math.min(1, d.optimal / d.reel));
    return Math.round(Math.min(...ratios) * 100);
  }

  private calculerAisanceMaxE2(): number {
    if (this.detailsAisanceE2.length === 0) return 100;
    const ratios = this.detailsAisanceE2.map(d => Math.min(1, d.optimal / d.reel));
    return Math.round(Math.max(...ratios) * 100);
  }

  private formaterDetailsAisanceE2() {
    return this.detailsAisanceE2.map(d => ({
      objetId: d.objetId,
      distanceReelle: d.reel,
      distanceOptimale: d.optimal,
      ratio: d.reel > 0 ? Math.min(1, d.optimal / d.reel) : 0
    }));
  }

  private preparerStatsEtape3() {
    return {
      temps: this.tempsE3,
      etapesBienOrdonnees: this.etapesOrdonneesSeul,
      etapesTotal: this.etapesTotal,
      recommencements: this.recommencementsE3,
      aides: this.isHelpEnabled() ? this.aidesE3 : []
    };
  }

}