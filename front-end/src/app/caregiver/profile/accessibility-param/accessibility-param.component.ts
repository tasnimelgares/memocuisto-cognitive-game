import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-accessibility-param',
  templateUrl: './accessibility-param.component.html',
  styleUrl: './accessibility-param.component.scss'
})
export class AccessibilityParamComponent {
  @Input() label: string = ''; // Malvoyant, malentendant
  @Input() description: string = ''; // "grossit les textes"
  

    // Profile et Accessibility-param se tiennent au courant de si coché ou pas avec :
  @Input() checked: boolean = false;  
  @Output() checkedChange = new EventEmitter<boolean>(); // checked+Change


  //quand il clique sur la case :
  toggleCheck() {
    this.checked = !this.checked;//inverse l'état
    this.checkedChange.emit(this.checked);//envoie l'info au parent
  }
}