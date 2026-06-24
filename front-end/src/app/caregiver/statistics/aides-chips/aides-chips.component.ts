import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-aides-chips',
  templateUrl: './aides-chips.component.html',
  styleUrls: ['./aides-chips.component.scss']
})
export class AidesChipsComponent {
  @Input() aides: string[] = [];

  getClasseAide(aide: string): string {
    const aidePropre = aide.trim().toLowerCase();
    if (aidePropre.includes('simple')) return 'chip-simple';
    if (aidePropre.includes('moyenne') || aidePropre.includes('moyen')) return 'chip-moyenne';
    if (aidePropre.includes('forte')) return 'chip-forte';
    if (aidePropre.includes('réponse') || aidePropre.includes('reponse')) return 'chip-reponse';
    return '';
  }
}