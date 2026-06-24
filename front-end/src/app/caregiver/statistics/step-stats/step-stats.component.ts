import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-step-stats',
  templateUrl: './step-stats.component.html',
  styleUrls: ['./step-stats.component.scss']
})
export class StepStatsComponent {

  @Input() title: string = '';
  @Input() score: number = 0;
  
  @Input() timeSpent: number = 0;
  @Input() timeLimit: string | number = 'illimite';
  
  @Input() aides: string[] = [];
  @Input() recommencements?: number;

}