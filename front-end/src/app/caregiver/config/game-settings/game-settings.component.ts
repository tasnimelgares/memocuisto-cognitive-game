import { Component } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
@Component({
  selector: 'app-game-settings',
  templateUrl: './game-settings.component.html',
  styleUrl: './game-settings.component.scss'
})
export class GameSettingsComponent {

  private DEBUG = true;
 

  //la liste des options On/Off
  optionsAccompagnement = [
    { id: 'plusEncouragements', label: "Plus d'encouragements", icon: '✨', active: false },
    { id: 'enleverTexteEchec', label: "Atténuer les retours d'échecs", icon: '🙈', active: false },
    { id: 'popupInactivite', label: "Rappel d'inactivité", icon: '⏰', active: false },
    { id: 'isLargeMode', label: "Agrandir les consignes ", icon: '🔘', active: false }
  ];

  constructor(private configService: ConfigService) {}
  ngOnInit() {
    // On écoute le service
    this.configService.config$.subscribe(config => {
      this.optionsAccompagnement.find(o => o.id === 'plusEncouragements')!.active = config.plusEncouragements;
      this.optionsAccompagnement.find(o => o.id === 'isLargeMode')!.active = config.isLargeMode;
      this.optionsAccompagnement.find(o => o.id === 'enleverTexteEchec')!.active = config.enleverTexteEchec;
      this.optionsAccompagnement.find(o => o.id === 'popupInactivite')!.active = config.popupInactivite;
    });
  }

  
toggleOption(option: any) {
    const newValue = !option.active;
    
    if (this.DEBUG) {
      console.log(`[DEBUG Settings] ⚙️ Clic sur le bouton : L'option '${option.id}' passe à ${newValue}`);
    }

    this.configService.updateConfig({ [option.id]: newValue });
  }
}
