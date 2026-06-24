import { Component,HostListener, OnDestroy, OnInit } from '@angular/core'; 
import { Router } from '@angular/router';
import { GameSessionService } from 'src/services/game-session.service';
import { Ingredient } from 'src/models/ingredient.model';
import { Recipe } from 'src/models/recipe.model';
import { ConfigService } from 'src/services/config.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, OnDestroy { 

  DEBUG: boolean = false;
  static dernierTempsConnu: number = 0;
  
  listeIngredients: Ingredient[] = [];
  currentRecipe!: Recipe ;
  isEntering: boolean = false; //l'animation de départ
  showNextButton: boolean = false;
  isFirstVisit: boolean = false;

  // --- VARIABLES POUR LE CHRONO ---
  tempsEcouleTotal: number = 0;
  helpEnabled: boolean = true;
  timingsAides: number[] = [];     
  rayonsEnSurbrillance: string[] = [];

  constructor(
    private router: Router,
    private gameService: GameSessionService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    const config = this.configService.getCurrentConfig();
    this.helpEnabled = config.helpEnabled && this.gameService.getIsSoloMode();
    this.timingsAides = config.timingsAides;
    this.restaurerSurbrillanceRayons();
    // On récupère le temps là où il s'était arrêté (ou à 0 si on vient de commencer)
    this.tempsEcouleTotal = this.gameService.getSavedTime();
    this.listeIngredients = this.gameService.getInventory();
    this.currentRecipe = this.gameService.getCurrentRecipe()!;
    this.showNextButton = this.gameService.isEverythingFound();
    this.isFirstVisit = !this.gameService.hasSeenIntro();
    if (!this.gameService.hasSeenIntro()) {
      this.isEntering = true;
      setTimeout(() => {
        this.isEntering = false;
        this.gameService.markIntroAsSeen(); 
      }, 5000);
    }
  }

  // On sauvegarde le temps juste avant de quitter le plan
  ngOnDestroy(): void {
    this.gameService.setSavedTime(this.tempsEcouleTotal);
  }

  // Le Timer met à jour cette variable chaque seconde
  mettreAJourTemps(temps: number): void {
    this.tempsEcouleTotal = temps;
    if (this.DEBUG) console.log(MapComponent.dernierTempsConnu);
    MapComponent.dernierTempsConnu = temps;
  }

  gererAides(tempsEcoule: number): void {
    if (!this.helpEnabled) return;
    if (
      tempsEcoule === this.timingsAides[1] ||
      tempsEcoule === this.timingsAides[2]
    ) {
      this.mettreEnSurbrillanceRayons();
    }
  }

  private mettreEnSurbrillanceRayons(): void {
    this.rayonsEnSurbrillance = [
      ...new Set(
        this.listeIngredients
          .filter(i => !i.selected)
          .map(i => i.rayon)
      )
    ];
  }

  private restaurerSurbrillanceRayons(): void {
  if (!this.helpEnabled) return;
  const tempsDepasse = MapComponent.dernierTempsConnu >= this.timingsAides[1];
  this.listeIngredients = this.gameService.getInventory();
  const resteDesIngredients = this.listeIngredients.some(i => !i.selected);
  if (this.DEBUG) {
    console.log("dernier temps connu", MapComponent.dernierTempsConnu);
    console.log("temps depasse", tempsDepasse);
    console.log("liste des ingredients", this.listeIngredients);
    console.log("restedesingredients",resteDesIngredients);
  }

  if (tempsDepasse && resteDesIngredients) {
    this.mettreEnSurbrillanceRayons();
  }
}

  allerAuRayon(zoneId: string): void {
    //On dit au service "Le joueur entre dans le rayon X"
    this.gameService.setCurrentRayon(zoneId);
    
    // On l'envoie dans le rayon
    this.router.navigate(['/step1']); 
  }


  
   @HostListener('document:click', ['$event'])
      onGlobalClick(event: MouseEvent): void {
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