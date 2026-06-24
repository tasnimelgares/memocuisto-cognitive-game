import { Component, Input } from '@angular/core';
import { Ingredient } from 'src/models/ingredient.model';

@Component({
  selector: 'app-ingredient-mini-item',
  templateUrl: './ingredient-mini-item.component.html',
  styleUrls: ['./ingredient-mini-item.component.scss']
})
export class IngredientMiniItemComponent {
  @Input() ingredient!: Ingredient;
}