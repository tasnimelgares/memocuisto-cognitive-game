import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/services/config.service';

@Component({
  selector: 'app-help-settings',
  templateUrl: './help-settings.component.html',
  styleUrl: './help-settings.component.scss'
})
export class HelpSettingsComponent implements OnInit {
  aideSimple: number = 30;
  aideMoyenne: number = 45;
  aideForte: number = 55;
  aideComplete: number = 65;

  readonly MAX_TIME = 300; 
  readonly STEP = 5; // écart minimum entre les aides
  helpEnabled: boolean = true;

  constructor(private configService: ConfigService) {}

  ngOnInit() {
  this.configService.config$.subscribe(config => {
    this.helpEnabled = config.helpEnabled ?? true;

    this.aideSimple = config.timingsAides[0];
    this.aideMoyenne = config.timingsAides[1];
    this.aideForte = config.timingsAides[2];
    this.aideComplete = config.timingsAides[3];
  });
}

toggleHelp() {
  this.helpEnabled = !this.helpEnabled;

  this.configService.updateConfig({
    helpEnabled: this.helpEnabled
  });
}

  updateTimings() {
    this.aideSimple = Number(this.aideSimple);
    this.aideMoyenne = Number(this.aideMoyenne);
    this.aideForte = Number(this.aideForte);
    this.aideComplete = Number(this.aideComplete);
    if (this.aideSimple < this.STEP) this.aideSimple = this.STEP;
    if (this.aideMoyenne < this.aideSimple + this.STEP) {
      this.aideMoyenne = this.aideSimple + this.STEP;
    }
    if (this.aideForte < this.aideMoyenne + this.STEP) {
      this.aideForte = this.aideMoyenne + this.STEP;
    }
    if (this.aideComplete < this.aideForte + this.STEP) {
      this.aideComplete = this.aideForte + this.STEP;
    }
    if (this.aideComplete > this.MAX_TIME) this.aideComplete = this.MAX_TIME;
    if (this.aideForte > this.MAX_TIME - this.STEP) this.aideForte = this.MAX_TIME - this.STEP;
    if (this.aideMoyenne > this.MAX_TIME - this.STEP * 2) this.aideMoyenne = this.MAX_TIME - this.STEP * 2;
    if (this.aideSimple > this.MAX_TIME - this.STEP * 3) this.aideSimple = this.MAX_TIME - this.STEP * 3;

    this.configService.updateConfig({
      timingsAides: [
        this.aideSimple, 
        this.aideMoyenne, 
        this.aideForte, 
        this.aideComplete
      ]
    });
  }

  getBackground(currentValue: number, minAllowed: number): string {
    const minPct = (minAllowed / this.MAX_TIME) * 100;
    const valPct = (currentValue / this.MAX_TIME) * 100;

    return `linear-gradient(to right, 
      #94a3b8 0%, 
      #94a3b8 ${minPct}%, 
      #60a5fa ${minPct}%, 
      #2563eb ${valPct}%, 
      #e2e8f0 ${valPct}%, 
      #e2e8f0 100%)`;
  }
}