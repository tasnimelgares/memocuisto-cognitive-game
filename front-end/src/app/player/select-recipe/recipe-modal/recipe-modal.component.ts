import { Component, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { RecipeService } from 'src/services/recipe.service';
import { Recipe } from 'src/models/recipe.model';
import { Observable } from 'rxjs';
import { ConfigService } from 'src/services/config.service';

@Component({
  selector: 'app-recipe-modal',
  templateUrl: './recipe-modal.component.html',
  styleUrl: './recipe-modal.component.scss'
})
export class RecipeModalComponent {

  @Input() category : string = "mes recette";

  @Output() selected = new EventEmitter<Recipe>();

  // On stocke le flux (Observable) plutôt que le tableau brut
  public recipes$: Observable<Recipe[]> = this.recipeService.getAllRecipes();

  constructor(public recipeService: RecipeService,public configService: ConfigService) {}

  ngOnChanges(changes: SimpleChanges) {
    // Dès que la catégorie change, on demande le nouveau flux au service
    if (changes['category']) {
      this.recipes$ = this.recipeService.getRecipesByCategoryAndDifficulty(this.category,this.configService.getCurrentConfig().difficulte);
    }
  }

  selectRecipe(recipe: Recipe) {
    this.selected.emit(recipe);
  }

}
