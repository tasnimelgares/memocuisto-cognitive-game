import { Component, Input, OnInit } from '@angular/core';
import { Ingredient } from 'src/models/ingredient.model';
import { Recipe } from 'src/models/recipe.model';
import { InventoryStateService } from 'src/services/inventory-state.service';
import { RecipeService } from 'src/services/recipe.service';
import { GameSessionService } from 'src/services/game-session.service'; 
@Component({
  selector: 'app-inventory',
  templateUrl: './app-inventory.component.html',
  styleUrl: './app-inventory.component.scss'
})
export class AppInventoryComponent implements OnInit {
  // On reçoit un tableau d'objets, les ingredients : [{name: 'Farine', selected: false}, ...]
  ingredients: Ingredient[] = [];
  @Input() currentRecipe!: Recipe ;

  isSolo: boolean = true; 

  constructor(
    public inventoryStateService: InventoryStateService,
    private recipeService: RecipeService,
    private gameSessionService: GameSessionService 
  ) {}

  ngOnInit() {
    this.ingredients = this.recipeService.getIngredientsForRecipe(this.currentRecipe.ingredientsIds);
    this.inventoryStateService.resetVisibility();

    // 4. On récupère le mode de jeu au chargement du composant
    this.isSolo = this.gameSessionService.getIsSoloMode(); 
  }

  toggleInventory() {
    this.inventoryStateService.toggleVisibility();
  }
}