import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-count-up-timer', 
  templateUrl: './count-up-timer.component.html',
  styleUrls: ['./count-up-timer.component.scss']
})
export class CountUpTimerComponent implements OnInit, OnDestroy {
  @Input() aideTimings: number[] = []; 
  @Input() startTime: number = 0;
  @Output() aideTriggered = new EventEmitter<number>();
  @Output() timeUpdated = new EventEmitter<number>();
  
  seconds: number = 0;
  timerInterval: any;

  ngOnInit() {
    this.seconds = this.startTime;
    this.timerInterval = setInterval(() => {
      this.seconds++;
      this.timeUpdated.emit(this.seconds);
      if (this.aideTimings.includes(this.seconds)) {
        this.aideTriggered.emit(this.seconds);
      }
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  get formattedTime(): string {
    const min = Math.floor(this.seconds / 60);
    const sec = this.seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }
}