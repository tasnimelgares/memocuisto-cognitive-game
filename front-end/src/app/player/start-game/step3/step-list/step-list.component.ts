import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { RecipeStep } from 'src/models/recipe.model';

@Component({
  selector: 'app-step-list',
  templateUrl: './step-list.component.html',
  styleUrls: ['./step-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepListComponent {
  // Le tableau d'étapes à afficher
  @Input() steps: RecipeStep[] = []; 
  
  // Définit si on affiche le badge avec le numéro (pour "Ma Recette")
  @Input() showBadge: boolean = false; 

  // L'événement renvoyé au parent quand on clique sur une étape
  @Output() stepClicked = new EventEmitter<RecipeStep>();

  onStepClick(step: any): void {
    this.stepClicked.emit(step);
  }
}