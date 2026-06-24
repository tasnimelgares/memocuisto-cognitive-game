import { Component } from '@angular/core';
import { GameTheme } from 'src/models/game-config.model';
import { ConfigService } from 'src/services/config.service';

@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrl: './color-palette.component.scss'
})
export class ColorPaletteComponent {

  palette: GameTheme[] = [
    { name: 'Couleur par défaut', hex: '', isDefault: true, isDark: false},
    { name: 'Bleu Nuage', hex: '#f0f7f8', isDefault: false, isDark: false },
    { name: 'Vert Menthe', hex: '#e8f5e9', isDefault: false, isDark: false },
    { name: 'Jaune Doux', hex: '#fff9c4', isDefault: false, isDark: false },
    { name: 'Rose Poudré', hex: '#fce4ec', isDefault: false, isDark: false },
    { name: 'Lavande', hex: '#f3e5f5', isDefault: false, isDark: false },
    { name: 'Sable', hex: '#efebe9', isDefault: false, isDark: false },
    { name: 'Gris Perle', hex: '#f5f5f5', isDefault: false, isDark: false },
    { name: 'Vert Sauge', hex: '#dcedc8', isDefault: false, isDark: false },
    { name: 'Crème Orange', hex: '#fff3e0', isDefault: false,isDark: false },
    { name: 'Gris Galet', hex: '#e0e0e0', isDefault: false, isDark: false },
    { name: 'Pêche', hex: '#ffccbc', isDefault: false, isDark: false },
    { name: 'Turquoise', hex: '#b2dfdb', isDefault: false, isDark: false },
    { name: 'Violet Doux', hex: '#d1c4e9', isDefault: false, isDark: false },
    { name: 'Bleu Azur', hex: '#bbdefb', isDefault: false, isDark: false },
    { name: 'Pomme', hex: '#c8e6c9', isDefault: false, isDark: false },
  ];

  selectedThemeName: string = '';

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    // on s'abonne pour savoir quelle couleur est actuellement sélectionnée
    this.configService.config$.subscribe(config => {
      if (config.theme) {
        this.selectedThemeName = config.theme.name;
      }
    });
  }

  selectTheme(theme: GameTheme) {
    this.configService.updateConfig({ theme: theme });
  }

}
