import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-indicator-card',
  templateUrl: './indicator-card.component.html',
  styleUrls: ['./indicator-card.component.scss']
})
export class IndicatorCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() value: number = 0;
  @Input() label: string = '';
  @Input() color: 'green' | 'yellow' | 'red' = 'green';
  @Input() recommendationText: string = '';
}