import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss' 
})
export class ButtonComponent {
  @Input() text: string = 'Cliquez ici'; 
  @Input() redirectTo: string | null = null; // null par défaut plutôt qu'une chaîne vide
  @Input() buttonColor: string = '#348485';  
  @Input() isLarge: boolean = false; 
  @Input() isDisabled: boolean = false; 
  @Input() icon: string = '';
  @Input() imgSrc: string = '';
  
  // On crée un événement que le parent pourra écouter
  @Output() action = new EventEmitter<void>();

  onClick(): void {
    if (!this.isDisabled) {
      this.action.emit(); // On signale au parent que le bouton a été cliqué
    }
  }
}