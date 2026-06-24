import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-info-input',
  templateUrl: './info-input.component.html',
  styleUrl: './info-input.component.scss'
})
export class InfoInputComponent {
  @Input() label: string = '';
  @Input() type: string = 'text'; // text par defaut, number pour l'age
  
  // Profile et Info-input se tiennent au courant des valeurs avec : 
  @Input() value: any; //pour le [(value)] venant du parent
  @Output() valueChange = new EventEmitter<any>(); // il prévient le parent. value + Change imposé par angular

  onValueChange(newValue: any) {
    this.valueChange.emit(newValue);
  }
}