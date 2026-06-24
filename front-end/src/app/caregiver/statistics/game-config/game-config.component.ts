import { Component, Input } from '@angular/core';
import { GameConfig } from '../../../../models/game-config.model'; // Ajuste le chemin si besoin !

@Component({
  selector: 'app-game-config',
  templateUrl: './game-config.component.html',
  styleUrls: ['./game-config.component.scss']
})
export class GameConfigComponent {
  @Input() config: GameConfig | undefined | null;
}