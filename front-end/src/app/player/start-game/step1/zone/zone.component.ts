import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
  styleUrl: './zone.component.scss'
})
export class ZoneComponent {

  @Input() image: string = '';
  @Input() name: string = '';
  @Input() zoneId: string = '';
  @Input() isHighlighted: boolean =false;

  // Événement envoyé au parent avec l'ID du rayon
  @Output() zoneClicked = new EventEmitter<string>();

  onClick() {
    this.zoneClicked.emit(this.zoneId);
  }
}