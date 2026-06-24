import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrl: './gauge.component.scss'
})
export class GaugeComponent {
  @Input() value: number = 0;
  @Input() label: string = '';
  @Input() color: 'green' | 'yellow' | 'red' = 'green';

}
