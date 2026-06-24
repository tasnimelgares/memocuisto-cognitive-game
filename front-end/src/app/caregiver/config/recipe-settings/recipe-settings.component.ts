import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { GameConfig } from 'src/models/game-config.model';

@Component({
  selector: 'app-recipe-settings',
  templateUrl: './recipe-settings.component.html',
  styleUrl: './recipe-settings.component.scss'
})
export class RecipeSettingsComponent implements OnInit {
  
  // On stocke toute la configuration ici pour que le HTML puisse la lire
  config!: GameConfig; 

  showAddRecipeForm: boolean = false;

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    this.configService.config$.subscribe(c => {
      // On met à jour l'objet config à chaque changement
      this.config = c;
    });
  }


  // --- FONCTIONS POUR ENVOYER LES CHANGEMENTS AU SERVICE ---

  // Pour le menu déroulant de difficulté
  onDifficulteChange(event: any) {
    this.configService.updateConfig({ difficulte: event.target.value });
  }
  // Pour le menu déroulant du pourcentage d'ingrédients
  onMaxIngredientsChange(event: any) {
    const valeurConvertie = Number(event.target.value); // Va transformer "50" en 50
    this.configService.updateConfig({ maxIngredientsParRayon: valeurConvertie });
  }
  
}