import { Component, Input } from '@angular/core';
import { RecipeStep } from 'src/models/recipe.model'; // Ajuste le chemin selon ton projet

@Component({
  selector: 'app-recipe-step-item',
  templateUrl: './recipe-step-item.component.html',
  styleUrls: ['./recipe-step-item.component.scss']
})
export class RecipeStepItemComponent {
  @Input() step!: RecipeStep;
}