import { Component, Input } from '@angular/core';
import { Ingredient } from 'src/models/ingredient.model';

@Component({
  selector: 'app-ingredient-card',
  templateUrl: './ingredient-card.component.html',
  styleUrl: './ingredient-card.component.scss'
})
export class IngredientCardComponent {

  defaultImage = 'assets/img/recette-defaut.png';

  @Input() ingredient!: Ingredient;

}