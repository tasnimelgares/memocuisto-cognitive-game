import { Component, OnInit } from '@angular/core';
import { Recipe } from 'src/models/recipe.model';
import { RecipeService } from 'src/services/recipe.service';
import { GameSessionService } from 'src/services/game-session.service'; 
import { PatientService } from 'src/services/patient.service'; 

@Component({
  selector: 'app-select-recipe',
  templateUrl: './select-recipe.component.html',
  styleUrls: ['./select-recipe.component.scss']
})
export class SelectRecipeComponent implements OnInit { 

  showMemorize: boolean = false;

  // On récupère l'ID du patient en texte
  get currentPatientId(): string | undefined {
    const id = this.patientService.currentPatient$.value?.id;
    return id !== undefined ? String(id) : undefined;
  }

  constructor(
    private recipeService: RecipeService,
    private gameSessionService: GameSessionService,
    private patientService: PatientService 
  ) {}

  ngOnInit(): void {
    // On vide la mémoire pour être sûr de commencer une nouvelle partie proprement
    this.gameSessionService.resetGame();

    // On force le chargement des recettes de ce patient
    this.recipeService.loadRecipes(this.currentPatientId);
  }

  onRecipeClick(recipe: Recipe) {
    this.recipeService.setSelectedRecipe(recipe);
    this.showMemorize = true;
  }

  goBack(){
    this.showMemorize = false;
  }
}