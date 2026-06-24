import { Component, OnInit, Input} from '@angular/core';
import { Recipe } from 'src/models/recipe.model';
import { Ingredient } from 'src/models/ingredient.model';
import { RecipeService } from 'src/services/recipe.service';
import { GameSessionService } from 'src/services/game-session.service';

@Component({
  selector: 'app-memorise-ingredients',
  templateUrl: './memorise-ingredients.component.html',
  styleUrl: './memorise-ingredients.component.scss'
})
export class MemoriseIngredientsComponent implements OnInit {
  recipe: Recipe | null = null;
  ingredients: Ingredient[] = [];

  @Input() text: string = '';
  isSolo: boolean = true;

  constructor(private recipeService: RecipeService, private gameSessionService : GameSessionService) {}

  ngOnInit() {
    this.recipeService.selectedRecipe$.subscribe(selectedRecipe => {
      if (selectedRecipe) {
        this.recipe = selectedRecipe;
        // On transforme les IDs en objets complets
        this.ingredients = this.recipeService.getIngredientsForRecipe(selectedRecipe.ingredientsIds);
      }
    });

    this.isSolo = this.gameSessionService.getIsSoloMode(); 
  }
}