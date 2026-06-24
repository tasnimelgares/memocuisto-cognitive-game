import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-global-summary',
  templateUrl: './global-summary.component.html',
  styleUrls: ['./global-summary.component.scss']
})
export class GlobalSummaryComponent {
  @Input() score: number = 0;
  @Input() temps: string = '';
}