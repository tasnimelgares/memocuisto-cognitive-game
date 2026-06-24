import { StatsService } from 'src/services/stats.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { GameSessionService } from 'src/services/game-session.service'; 
import { ConfigService } from 'src/services/config.service'; 
import { GameConfig } from 'src/models/game-config.model'; 
import { RecipeStep } from 'src/models/recipe.model'; 

// Import du module Drag & Drop
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { EncouragementTextComponent } from 'src/app/shared/encouragement-text/encouragement-text.component';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss']
})
export class StepsComponent implements OnInit, OnDestroy {
  feedbackMessage: string = '';
  feedbackColor: string = '';
  feedbackVoiceId: string = '';
  gameWon: boolean = false;
  recipeImage: string = ''; 
  tempsEcouleTotal: number = 0;
  etapesDonneesParAide: number = 0;
  isEntering: boolean = false;

  private initialSteps: RecipeStep[] = [];
  availableSteps: RecipeStep[] = [];
  playerRecipe: RecipeStep[] = [];

  // Variables pour la configuration
  gameConfig!: GameConfig;
  private configSub!: Subscription;

  constructor(
    private gameSessionService: GameSessionService,
    private configService: ConfigService,
    private statsService: StatsService,
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

    this.loadRecipeSteps();
    this.initGame();
  }

  ngOnDestroy(): void {
    if (this.configSub) {
      this.configSub.unsubscribe();
    }
    this.gameSessionService.enregistrerTempsEtape(3, this.tempsEcouleTotal); 
  }

  mettreAJourTemps(temps: number): void {
    this.tempsEcouleTotal = temps;
  }

  loadRecipeSteps(): void {
    const currentRecipe = this.gameSessionService.getCurrentRecipe();

    if (currentRecipe) {
      this.recipeImage = (currentRecipe as any).imageUrl || 'assets/img/recette-defaut.jpg'; 
    }

    if (currentRecipe && currentRecipe.steps) {
      this.initialSteps = currentRecipe.steps.map((step: any) => ({
        ...step,
        highlighted: false
      }));
    } else {
      console.warn("Aucune recette en cours ou la recette ne contient pas d'étapes !");
      this.initialSteps = []; 
    }
  }

  initGame(): void {
    this.availableSteps = this.initialSteps.map(step => ({ ...step, highlighted: false }));
    this.playerRecipe = [];
    this.feedbackMessage = '';
    this.gameWon = false;
    this.etapesDonneesParAide = 0;
  }

  // pour créer une case vide (Placeholder)
  private creerEtapeVide(index: number): RecipeStep {
    return {
      id: -100 - index,
      order: -1,
      text: 'Emplacement vide',
      imgPath: '', 
      highlighted: false,
      userOrder: index + 1
    } as RecipeStep;
  }

  selectStep(step: RecipeStep): void {
    if (this.playerRecipe.includes(step)) return;

    this.availableSteps = this.availableSteps.filter(s => s.id !== step.id);
    
    if (step.highlighted) {
      step.highlighted = false;
      if (this.feedbackMessage === "Et si on commençait par ça ?") {
        this.feedbackMessage = '';
      }
    }

    // On cherche le premier "trou" (id négatif) pour insérer l'étape à la bonne place
    const emptyIndex = this.playerRecipe.findIndex(s => s.id < 0);
    if (emptyIndex !== -1) {
      step.userOrder = emptyIndex + 1;
      this.playerRecipe[emptyIndex] = step;
      this.playerRecipe = [...this.playerRecipe]; // Forcer le rafraichissement
    } else {
      step.userOrder = this.playerRecipe.length + 1;    
      this.playerRecipe = [...this.playerRecipe, step];
    }
  }

  removeStep(stepToRemove: RecipeStep): void {
    const index = this.playerRecipe.findIndex(step => step.id === stepToRemove.id);
    if (index !== -1) {
      // On remplace l'étape enlevée par une case vide pour garder la position des autres
      this.playerRecipe[index] = this.creerEtapeVide(index);
    }

    delete stepToRemove.userOrder; 
    this.availableSteps = [...this.availableSteps, stepToRemove];
    this.playerRecipe = [...this.playerRecipe]; // Forcer le rafraichissement
  }

  drop(event: CdkDragDrop<RecipeStep[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const draggedStep = event.previousContainer.data[event.previousIndex];
      if (draggedStep && draggedStep.highlighted) {
        draggedStep.highlighted = false;
        if (this.feedbackMessage === "Et si on commençait par ça ?") this.feedbackMessage = '';
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Ajustements Drag & Drop pour gérer les espaces vides
      if (event.container.data === this.playerRecipe) {
        // Une étape a été glissée vers la recette, on enlève un espace vide pour faire de la place
        const placeholderIdx = this.playerRecipe.findIndex(s => s.id < 0);
        if (placeholderIdx !== -1) {
          this.playerRecipe.splice(placeholderIdx, 1);
        }
      } else if (event.previousContainer.data === this.playerRecipe) {
        // Une étape a été retirée de la recette, on met un espace vide à son ancienne place
        this.playerRecipe.splice(event.previousIndex, 0, this.creerEtapeVide(event.previousIndex));
      }
    }

    this.availableSteps = this.availableSteps.map(step => {
      delete step.userOrder;
      return step;
    });

    this.playerRecipe = this.playerRecipe.map((step, index) => ({
      ...step,
      userOrder: index + 1,
      highlighted: false
    }));

    this.availableSteps = [...this.availableSteps];
    this.playerRecipe = [...this.playerRecipe];
  }

  resetSteps(manuel: boolean = true): void {
    if (manuel) {
      this.gameSessionService.ajouterRecommencementEtape3(); 
    }
    this.initGame();
  }

  checkRecipe(): void {
    // La recette est considérée incomplète si la taille n'est pas bonne OU s'il y a des "trous" (id < 0)
    const isComplete = this.playerRecipe.length === this.initialSteps.length && !this.playerRecipe.some(step => step.id < 0);
    
    if (!isComplete) {
      if (this.gameConfig.plusEncouragements){
        this.feedbackMessage = EncouragementTextComponent.obtenirMessageAleatoire(this.recetteIncomplete);
      } else {
        this.feedbackMessage = "Il faut placer toutes les étapes dans la recette !";
      }
      this.feedbackColor = "var(--couleur-aide)"; 
      return;
    }

    const expectedPattern = this.initialSteps
      .map(step => step.order)
      .sort((a, b) => a - b);

    let isCorrect = true;
    const newPlayerRecipe: RecipeStep[] = [];
    const incorrectSteps: RecipeStep[] = [];

    // On vérifie chaque place sans les casser
    for (let i = 0; i < expectedPattern.length; i++) {
      const step = this.playerRecipe[i];

      if (step && step.order === expectedPattern[i]) {
        // C'est juste, elle reste à sa place exacte
        newPlayerRecipe[i] = step;
      } else {
        isCorrect = false;
        // C'est faux, on la renvoie en haut
        if (step && step.id > 0) {
          incorrectSteps.push(step);
        }
        // Et on laisse un "trou" à sa place
        newPlayerRecipe[i] = this.creerEtapeVide(i);
      }
    }

    if (isCorrect) {
      console.log("[Etape 3] une victoire Manuelle");
      this.gameWon = true;
      if (this.gameConfig.modeMalvoyant){
        this.feedbackVoiceId = 'success_final';
      }
      this.feedbackMessage = "Félicitations !";
      this.feedbackColor="var(--couleur-succes)";
      const scoreJoueur = this.initialSteps.length - this.etapesDonneesParAide;
      this.gameSessionService.enregistrerScoreEtape3(scoreJoueur, this.initialSteps.length);
      this.gameSessionService.enregistrerTempsEtape(3, this.tempsEcouleTotal);
      const resultatFinal = this.gameSessionService.genererResultatFinal();
      this.statsService.sauvegarderPartie(resultatFinal);
      
      const message = this.gameConfig.plusEncouragements 
        ? "Bravo ! Félicitations, la recette est parfaite ! 👨‍🍳👩‍🍳" 
        : "Félicitations ! La recette est prête ! 🍽️";
      
      this.router.navigate(['/success'], { 
        state: { 
          feedbackMessage: message,
          recipeImageUrl: this.recipeImage 
        } 
      });

    } else {
      // On met à jour les tableaux avec les cases vides et les fausses étapes renvoyées
      this.playerRecipe = newPlayerRecipe;
      this.availableSteps = [...this.availableSteps, ...incorrectSteps];
      this.availableSteps.forEach(step => delete step.userOrder);

      if (this.gameConfig.plusEncouragements){
        this.feedbackMessage = "Les étapes bien placées sont restées ! Replace celles qui sont remontées dans les trous.";
      } else {
        if (this.gameConfig.modeMalvoyant && !this.gameConfig.enleverTexteEchec){
          this.feedbackVoiceId = 'error';
        }
        this.feedbackMessage = this.gameConfig.enleverTexteEchec ?
        "Presque ! Remplis les cases vides avec les bonnes étapes." 
        : EncouragementTextComponent.obtenirMessageAleatoire(this.erreurOrdreRecette);
      }      
      this.feedbackColor = "var(--couleur-erreur)";

      setTimeout(() => {
          this.feedbackMessage = '';
      }, 3000);
    }
  }

  private recetteIncomplete = [
    "La recette prend forme "+this.configService.getPatientNickname()+", continue à ajouter des étapes !",
    "On dirait qu'il manque des étapes pour finir la recette...",
  ];

  private erreurOrdreRecette = [
    "Mélangeons encore un peu les idées, essayons un autre ordre !",
    "Pas tout à fait "+this.configService.getPatientNickname()+", mais on y est presque. On réessaie ?",
    "Voyons voir... Inversons peut-être deux étapes pour voir ?",
    "La cuisine demande de la patience, essayons différemment !",
  ];

  gererAides(tempsEcoule: any): void {
    if (this.gameWon) return;
    if (!this.gameConfig.helpEnabled) return; 
    const temps = Number(tempsEcoule);
    const timings = this.gameConfig.timingsAides;

    if (temps === timings[0]) this.aideSimple();
    if (temps === timings[1]) this.aideMoyenne();
    if (temps === timings[2]) this.aideForte();
    if (temps === timings[3]) this.aideComplete();
  }

  private aideSimple(): void {
    if (this.playerRecipe.length === 0 && this.availableSteps.length > 0) {
      const step1 = this.availableSteps.find(s => s.order === 1);
      if (step1) step1.highlighted = true;
      this.gameSessionService.enregistrerAide(3, 'Aide Simple');
      if (this.gameConfig.plusEncouragements){
        this.feedbackMessage = "Et si on commençait par ça ?";
        this.feedbackColor = "var(--couleur-aide)";
      }
    }
  }

  private simulerClicSurEtape(numEtape: number): void {
    const step = this.availableSteps.find(s => s.order === numEtape);
    if (step) {
      this.selectStep(step);
    }
  }

  private aideMoyenne(): void {
    const etapeDeJaPresente = this.playerRecipe.some(step => step.order === 1);
    this.resetSteps(false);
    this.simulerClicSurEtape(1);
    this.etapesDonneesParAide = 1;
    this.gameSessionService.enregistrerAide(3, 'Aide Moyenne');
    if (this.gameConfig.plusEncouragements && !etapeDeJaPresente){
        this.feedbackMessage = "Regarde, nous avons ajouté une étape pour t'aider !";
        this.feedbackColor = "var(--couleur-aide)";
    }
  }

  private aideForte(): void {
    this.resetSteps(false);
    this.simulerClicSurEtape(1);
    setTimeout(() => this.simulerClicSurEtape(2), 300);
    this.etapesDonneesParAide = 2;
    this.gameSessionService.enregistrerAide(3, 'Aide Forte');
    if (this.gameConfig.plusEncouragements){
        this.feedbackMessage = "Voici une étape de plus pour vous aider, continuez d'essayer !";
        this.feedbackColor = "var(--couleur-aide)";
    }
  }

  private aideComplete(): void {
    this.resetSteps(false);
    this.gameSessionService.enregistrerAide(3, 'Réponse Entière');
    
    const sortedSteps = [...this.initialSteps].sort((a, b) => a.order - b.order);
    
    sortedSteps.forEach((step, index) => {
      setTimeout(() => this.simulerClicSurEtape(step.order), 200 * (index + 1));
    });
    
    setTimeout(() => {
      this.gameWon = true;
      this.gameSessionService.enregistrerScoreEtape3(0, this.initialSteps.length);
      this.gameSessionService.enregistrerTempsEtape(3, this.tempsEcouleTotal);
      const resultatFinal = this.gameSessionService.genererResultatFinal();
      this.statsService.sauvegarderPartie(resultatFinal);
      
      this.router.navigate(['/success'], { 
        state: { 
          feedbackMessage: "Voici la recette complète !",
          recipeImageUrl: this.recipeImage
        } 
      });
    }, 200 * sortedSteps.length + 200);
  }
}