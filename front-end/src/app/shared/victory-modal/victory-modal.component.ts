import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-victory-modal',
  templateUrl: './victory-modal.component.html',
  styleUrls: ['./victory-modal.component.scss'] 
})
export class VictoryModalComponent {
  // Permet de personnaliser le texte principal
  @Input() title: string = 'Félicitations !';
  
  // Permet de personnaliser le texte descriptif
  @Input() message: string = 'Tu as réussi cette étape !';
  
  // Permet de personnaliser le texte du bouton
  @Input() buttonText: string = 'Continuer ➡';

  // Événement déclenché quand on clique sur le bouton
  @Output() continueClicked = new EventEmitter<void>();

  onContinue() {
    this.continueClicked.emit();
  }
}