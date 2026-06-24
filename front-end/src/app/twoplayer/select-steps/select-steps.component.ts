import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { RecipeStep } from 'src/models/recipe.model';
import { RecipeService } from 'src/services/recipe.service';

@Component({
  selector: 'app-select-steps',
  templateUrl: './select-steps.component.html',
  styleUrls: ['./select-steps.component.scss']
})
export class SelectStepsComponent {
  @Input() control!: AbstractControl | null;

  private nextIdBase: number = 0;
  steps: RecipeStep[] = [];
  currentStepText: string = '';
  readonly MAX_STEPS: number = 20; 

  constructor (private recipeService : RecipeService){
    this.nextIdBase = Number(this.recipeService.getNextStepId());
  }

  get formControl(): FormControl {
    return this.control as FormControl;
  }

  addStep() {
    // On bloque si le texte est vide ou si la limite est atteinte
    if (this.currentStepText.trim() === '' || this.steps.length >= this.MAX_STEPS) return;

    const newStep: RecipeStep = {
      id: this.nextIdBase + this.steps.length,
      text: this.currentStepText,
      order: this.steps.length + 1,
    };

    this.steps = [...this.steps, newStep];
    this.updateFormControl();
    this.currentStepText = '';
  }

  removeStep(index: number) {
    this.steps.splice(index, 1);
    this.steps.forEach((s, i) => s.order = i + 1);
    this.updateFormControl();
  }

  private updateFormControl() {
    if (this.formControl) {
      this.formControl.setValue(this.steps);
      this.formControl.markAsDirty();
      this.formControl.markAsTouched();
    }
  }

  reset(){
    this.steps = [];
    this.nextIdBase = 0;
    this.currentStepText = '';
    this.formControl.reset('');
  }
}