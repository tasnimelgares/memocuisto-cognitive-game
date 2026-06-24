import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent {
  @Input() label: string = '';
  // pour récupérer le formControl du parent
  @Input() control!: AbstractControl | null; 

  // pour un input
  @Input() placeholder: string = '';
  @Input() type: string = 'text';

  // pour un select
  @Input() options: any[] | null = []; // Liste des catégories
  @Input() valueKey: string = 'id';    // La clé pour la valeur (ex: id)
  @Input() labelKey: string = 'label'; // La clé pour l'affichage (ex: label)
  @Input() defaultOption: string = 'Choisir une option';

  // getter pour simplifier le typage dans le HTML
  get formControl(): FormControl {
    return this.control as FormControl;
  }

  // affichage des messages d'erreur
  get errorMessage(): string {
    if (!this.formControl || !this.formControl.errors || !this.formControl.touched) {
      return '';
    }

    // Liste des messages prioritaires
    if (this.formControl.hasError('required')) return 'Ce champ est obligatoire.';
    if (this.formControl.hasError('minlength')) {
      const requiredLength = this.formControl.errors['minlength'].requiredLength;
      return `Ajoutez au moins ${requiredLength} élément(s).`;
    }

    // Si erreur autre
    return 'Valeur incorrecte.';
  } 

  reset(){
    this.formControl.reset('');
  }
}