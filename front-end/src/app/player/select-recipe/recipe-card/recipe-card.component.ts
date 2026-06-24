import { Component, Input } from '@angular/core';
import { Recipe } from 'src/models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss'
})
export class RecipeCardComponent {

  @Input() recipe!: Recipe;

  // une image par défaut si imageUrl est vide
  defaultImage = 'assets/img/recette-defaut.png';

}
