import { Component } from '@angular/core';
import  { ConfigService } from 'src/services/config.service';

@Component({
  selector: 'app-config-info',
  templateUrl: './config-info.component.html',
  styleUrl: './config-info.component.scss'
})
export class ConfigInfoComponent {
  
  currentDifficulty: string = 'Facile';
  currentStep1Time: number | 'illimite' = 'illimite';
  currentStep2Time: number | 'illimite' = 'illimite';
  currentStep3Time: number | 'illimite' = 'illimite';

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    this.currentDifficulty = this.configService.getCurrentConfig().difficulte;
    this.currentStep1Time = this.configService.getCurrentConfig().tempsEtape1;
    this.currentStep2Time = this.configService.getCurrentConfig().tempsEtape2;
    this.currentStep3Time = this.configService.getCurrentConfig().tempsEtape3;
  }

  formatTime(time: number | 'illimite'): string {
    if (time === 'illimite') {
      // Retourne "Illimite" avec l'accent et sans le "s"
      return 'illimité'; 
    }
    // Retourne le nombre suivi d'un "s" minuscule
    return `${time}s`;
  }

  isConfigVisible = false;

  toggleConfig() {
    this.isConfigVisible = !this.isConfigVisible;
  }

}
