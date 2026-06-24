import { Component, HostListener, OnDestroy, OnInit } from '@angular/core'; 
import { Router } from '@angular/router';
import { Ingredient } from 'src/models/ingredient.model';
import { Recipe } from 'src/models/recipe.model';
import { GameSessionService } from 'src/services/game-session.service';
import { IngredientService } from 'src/services/ingredient.service';
import { ConfigService } from 'src/services/config.service';
import { EncouragementTextComponent } from 'src/app/shared/encouragement-text/encouragement-text.component';
import { GameConfig } from 'src/models/game-config.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-store-section',
  templateUrl: './store-section.component.html',
  styleUrl: './store-section.component.scss'
})
export class StoreSectionComponent implements OnInit, OnDestroy {

  DEBUG: boolean = true;
  
  // Variables pour gérer l'affichage
  feedbackMessage: string = '';
  feedbackColor: string = "var(--couleur-succes)";
  feedbackVoiceId: string = '';
  isVictorious: boolean = false; 
  encouragementAudio: boolean = true;
  firstTime = true;

  currentRecipe!: Recipe;
  listeIngredients: Ingredient[] = [];
  ingredientsSurEtagere: Ingredient[] = []; // La liste des produits affichés sur les étagères
  idsEnSurbrillance: string[] = []; 

  timingsAides: number[] = []; 
  helpEnabled: boolean = true;
  tempsEcouleTotal: number = 0; // pour stocker le temps localement

  gameConfig!: GameConfig;
  private configSub!: Subscription;

  constructor(
    private gameService: GameSessionService, 
    private ingredientService: IngredientService,
    private configService: ConfigService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.configSub = this.configService.config$.subscribe(config => {
      this.gameConfig = config;
    });
    this.helpEnabled = this.gameConfig.helpEnabled && this.gameService.getIsSoloMode();
    this.encouragementAudio = this.gameService.getIsSoloMode();
    if (this.DEBUG) console.log("helpEnable : ",this.helpEnabled);
    this.timingsAides = this.gameConfig.timingsAides;

    this.currentRecipe = this.gameService.getCurrentRecipe()!; // On charge la recette en premier 
    
    this.tempsEcouleTotal = this.gameService.getSavedTime(); // on recup le temps du service
    this.listeIngredients = this.gameService.getInventory(); // la liste de ce qu'il faut trouver (Inventaire)
    
    const rayonActuel = this.gameService.getCurrentRayon(); // le rayon dans lequel on vient d'entrer
    this.initialiserEtagere(rayonActuel);
    
    // initialisation du score pour l'étape 1
    this.gameService.enregistrerScoreEtape1(0, this.listeIngredients.length);

    this.restaurerAidesVisuelles(); // restaure les aides aussi
  }

  private initialiserEtagere(rayonActuel: string): void {
    // on vérifie si le service possède déjà ce rayon en mémoire
    const etagereMemoire = this.gameService.getIngredientsEtagere(rayonActuel);
    
    if (etagereMemoire && etagereMemoire.length > 0) {
      if (this.DEBUG) console.log(`[Mémoire] Le rayon "${rayonActuel}" existe déjà. Restauration...`);
      this.ingredientsSurEtagere = etagereMemoire;
      return;
    }

    if (this.DEBUG) console.log(`[Mémoire] Premier passage dans le rayon "${rayonActuel}". Génération...`);

    // si le service n'a rien, on fait le calcul initial (ton code actuel)
    const tousLesIngredientsDuRayon = this.ingredientService.getAllIngredients()
    .filter(item => item.rayon === rayonActuel);
    
    // si c'est 100 on s'embête pas avec les calculs
    if (this.gameConfig.maxIngredientsParRayon != 100) {
      this.ingredientsSurEtagere = tousLesIngredientsDuRayon;
    } 
    else {
      const tousLesIngredientsDuRayon = this.ingredientService.getAllIngredients()
      .filter(item => item.rayon === rayonActuel);

      const requis = tousLesIngredientsDuRayon.filter(item => this.estIngredientValide(item.id));
      const optionnels = tousLesIngredientsDuRayon.filter(item => !this.estIngredientValide(item.id));

      const densite = this.gameConfig?.maxIngredientsParRayon ?? 100; 
      let tailleCible = Math.round(tousLesIngredientsDuRayon.length * (densite / 100));

      const limiteBasse = Math.min(5, tousLesIngredientsDuRayon.length);
      tailleCible = Math.max(limiteBasse, tailleCible);

      const nbOptionnelsAAjouter = Math.max(0, tailleCible - requis.length);

      const optionnelsAleatoires = optionnels.sort(() => 0.5 - Math.random());
      const optionnelsSelectionnes = optionnelsAleatoires.slice(0, nbOptionnelsAAjouter);

      const etagereComplete = [...requis, ...optionnelsSelectionnes];
      this.ingredientsSurEtagere = etagereComplete.sort(() => 0.5 - Math.random());
    }

    // on envoie la liste finale au service pour la figer pour la partie
    this.gameService.setIngredientsEtagere(rayonActuel, this.ingredientsSurEtagere);
  }

  ngOnDestroy(): void {
    this.gameService.setSavedTime(this.tempsEcouleTotal); // Juste avant que la page ne se détruise (quand on clique sur Retour)
    this.gameService.enregistrerTempsEtape(1, this.tempsEcouleTotal);
  }
  
  mettreAJourTemps(temps: number): void {
    this.tempsEcouleTotal = temps;
    if (this.DEBUG) console.log("store section temps:",this.tempsEcouleTotal);
  }

  // validation ingredient
  private estIngredientValide(ingredientId: any): boolean {
    return this.currentRecipe.ingredientsIds.some((req: any) => {
      // Si c'est un tableau (ex: [10, 113]), on vérifie si l'ID est dedans
      if (Array.isArray(req)) {
        return req.includes(ingredientId) || req.includes(Number(ingredientId));
      }
      // Sinon on fait une vérification classique
      return req === ingredientId || req === Number(ingredientId);
    });
  }
 

  // Gère le clic sur n'importe quel ingrédient
  selectItem(itemClique: Ingredient, exclureScore: boolean = false): void {
    if (itemClique.selected) {
      return; 
    }
    const estDansLaListe = this.estIngredientValide(itemClique.id);

    if (estDansLaListe) {
      this.gameService.markAsFound(itemClique.id); 
      itemClique.selected = true; // On grise l'objet
      if (this.gameConfig.plusEncouragements) {
        this.feedbackMessage = EncouragementTextComponent.obtenirMessageAleatoire(this.succesMessages);
      } else {
        if (this.gameConfig.modeMalvoyant && !exclureScore){
          this.feedbackVoiceId = 'success';
        }
        this.feedbackMessage = "Très bien !"; // Retour standard simple
      }
      this.feedbackColor = "var(--couleur-succes)";
      
      // On retire la surbrillance si c'était un indice
      this.idsEnSurbrillance = this.idsEnSurbrillance.filter(id => id !== itemClique.id);
      
      if (!exclureScore) { 
      this.gameService.incrementerScoreManuelEtape1();
    }
      this.gameService.enregistrerScoreEtape1(
        this.gameService.scoreManuelEtape1, 
        this.listeIngredients.length
      );
      this.checkVictory();
      
    } else {
      if (this.gameConfig.plusEncouragements) {
        this.feedbackMessage = EncouragementTextComponent.obtenirMessageAleatoire(this.erreurMessages);
      } else {
        if (this.gameConfig.modeMalvoyant){
          this.feedbackVoiceId = 'error';
        }
        this.feedbackMessage = "On dirait que cet ingrédient n'est pas sur la liste."; // Retour standard factuel
      }
      this.feedbackColor = "var(--couleur-erreur)"; 
    }

    // On efface le message si on n'a pas encore gagné
    setTimeout(() => {
      if (!this.isVictorious) {
        this.feedbackMessage = '';
        this.feedbackVoiceId = '';
      }
    }, 3000);
  }

  // Vérifie si le joueur a tout trouvé
  private checkVictory(): void {
    if (this.gameService.isEverythingFound()) {
      if (this.gameConfig.modeMalvoyant) this.feedbackVoiceId = 'success_courses';
      this.feedbackMessage = "Bravo, le caddie est plein !";
      this.feedbackColor = "var(--couleur-info)"; 
      // Affiche l'overlay de victoire 
      this.isVictorious = true; 
    }

    // 
    if (this.configService.getCurrentConfig().plusEncouragements){
      const totalATrouver = this.listeIngredients.length;
      const totalTrouves = this.listeIngredients.filter(i => i.selected).length;
      if (totalTrouves >= Math.floor(totalATrouver / 2)+1){
        this.feedbackMessage = "Déjà la moitié de trouvée ! Continuez ainsi !";
        this.feedbackColor = "var(--couleur-succes)"; // Une couleur bleue encourageante
      }
    }
  }

  // Déclenchée au clic sur le bouton de la modale de victoire
  allerEnCuisine(): void {
    this.gameService.enregistrerScoreEtape1(
      this.gameService.scoreManuelEtape1, 
      this.listeIngredients.length
    );
    this.router.navigate(['/step2']);
  }

  // fonction appelée par le chrono
  gererAides(tempsEcoule: number) {
    if (!this.helpEnabled) return;

    if (tempsEcoule >= this.timingsAides[0] && tempsEcoule < this.timingsAides[1]) this.aideSimple();
    else if (tempsEcoule >= this.timingsAides[1] && tempsEcoule < this.timingsAides[2]) this.aideMoyenne();
    else if (tempsEcoule >= this.timingsAides[2] && tempsEcoule < this.timingsAides[3]) this.aideForte();
    else if (tempsEcoule >= this.timingsAides[3]) this.aideComplete();
  }
  
  // Calcule en temps réel ce qu'il reste à prendre sur ces étagères
  get produitsManquantsDuRayon(): Ingredient[] {
    return this.ingredientsSurEtagere.filter(itemEtagere => {
      const estDansListe = this.estIngredientValide(itemEtagere.id);
      return estDansListe && !itemEtagere.selected;
    });
  }


  // --- SYSTÈME D'AIDES PROGRESSIVES ---
  aideSimple(): void {
    const manquants = this.produitsManquantsDuRayon;
    if (manquants.length > 0) {
      // On illumine juste le premier objet manquant
      this.idsEnSurbrillance = [manquants[0].id]; 
      this.gameService.enregistrerAide(1, 'Aide Simple');
    }
  }

  aideMoyenne(): void {
    const manquants = this.produitsManquantsDuRayon;
    // On illumine tous les objets manquants du rayon
    this.idsEnSurbrillance = manquants.map(m => m.id); 
    this.gameService.enregistrerAide(1, 'Aide Moyenne');
  }

  aideForte(): void {
    this.aideMoyenne(); 
    const manquants = this.produitsManquantsDuRayon;
    if (manquants.length > 0) {
      // On ramasse automatiquement un objet pour le patient
      this.selectItem(manquants[0], true);
      this.gameService.enregistrerAide(1, 'Aide Forte');

      const config = this.configService.getCurrentConfig();
      if (config.plusEncouragements) {
        this.feedbackMessage = EncouragementTextComponent.obtenirMessageAleatoire(this.aideMessages);
      } else {
        if (this.gameConfig.modeMalvoyant){
          this.feedbackVoiceId = 'help';
        }
        this.feedbackMessage = "On t'a aidé à prendre un ingrédient !";
      }
      this.feedbackColor = "var(--couleur-aide)"; 
    }

    // On efface le message si on n'a pas encore gagné
    setTimeout(() => {
      if (!this.isVictorious) {
        this.feedbackMessage = '';
        this.feedbackVoiceId = '';
      }
    }, 3000);
  }

  aideComplete(): void {
    const manquants = this.produitsManquantsDuRayon;
    // On ramasse tout le reste
    manquants.forEach(item => this.selectItem(item, true)); 
    this.gameService.enregistrerAide(1, 'Réponse Entière');
    this.feedbackMessage = "Les derniers ingrédients du rayon ont été récupérés !";
    this.feedbackColor = "var(--couleur-info)"; // Bleu informatif
  }

  
  // ---- MESSAGES D'AIDES VARIES ---
  private succesMessages = [
    "Très bien "+this.configService.getPatientNickname()+"!",
    "Bien joué "+this.configService.getPatientNickname()+"!",
    "C'est exactement ça "+this.configService.getPatientNickname()+"!",
    "Super "+this.configService.getPatientNickname()+", tu as l'œil !",
    "Et un de plus dans le caddie !",
    "Excellent choix "+this.configService.getPatientNickname()+"!"
  ];

  private erreurMessages = [
    "Celui ci n'est pas sur la liste, essayons-en un autre !",
    "Pas de souci "+this.configService.getPatientNickname()+", essayez encore !",
    "Celui là on le garde pour une prochaine recette !",
    "Oups, continuons à chercher ensemble !",
    "Regardons à nouveau la liste !"
  ];

  private aideMessages = [
    "On avance ensemble "+this.configService.getPatientNickname()+"! Un ingrédient de récupéré.",
    "Hop ! On t'aide à mettre celui-ci dans le caddie.",
    "Regardez, on a trouvé cet ingrédient pour vous !"
  ];

  restaurerAidesVisuelles(): void {
    if (!this.helpEnabled) return;
    // On vérifie du temps le plus grand au plus petit
    if (this.tempsEcouleTotal >= this.timingsAides[3]) {
      this.aideComplete();
    } 
    else if (this.tempsEcouleTotal >= this.timingsAides[2]) {
      this.aideForte();
    } 
    else if (this.tempsEcouleTotal >= this.timingsAides[1]) {
      this.aideMoyenne();
    } 
    else if (this.tempsEcouleTotal >= this.timingsAides[0]) {
      this.aideSimple();
    }
  }


 @HostListener('document:click', ['$event'])
    onGlobalClick(event: MouseEvent): void {
      if (this.isVictorious) return;
      const target = event.target as HTMLElement;

      const clickedComponent =
        target.closest('app-button') ||
        target.closest('app-ingredient-card') || 
        target.closest('.rayon-item') || 
        target.closest('app-inventory') ||
        target.closest('app-sidebar') ||
        target.closest('app-zone') ||
        target.closest('app-instruction');

      if (clickedComponent) {
        console.log(`[PRÉCISION] Clic Valide sur : <${clickedComponent.tagName.toLowerCase()}>`);
        this.gameService.ajouterClicValideE1(); 
        return;
      }
      console.warn("[PRÉCISION] Clic Hors-Cible !! ");
      this.gameService.ajouterClicHorsCibleE1(); 
    }
}