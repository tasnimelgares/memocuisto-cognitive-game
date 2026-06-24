export interface GameConfig {
  // --- Accompagnement ---
  plusEncouragements: boolean;
  isLargeMode: boolean; 
  modeMalvoyant : boolean,
  enleverTexteEchec: boolean;
  popupInactivite: boolean;
  

  // --- Recette ---
  difficulte: 'facile' | 'moyen' | 'difficile'|'tout';
  maxIngredientsParRayon: number,
  budgetActif: boolean;
  budgetMax: number;
  tempsEtape1: number | 'illimite'; 
  tempsEtape2: number | 'illimite';
  tempsEtape3: number | 'illimite';

  // --- Aides ---
  helpEnabled: boolean; 
  timingsAides: number[]; 

  // --- Vocal ---
  typeVoix: 'feminine' | 'masculine' | 'proche';
  audios: { [key: string]: string }; // Contiendra les sons enregistrés
  
  // --- Mode à deux ---
  roleplayActif: boolean;
  personnaliseActif: boolean;

  // --- Visuel ---
  theme: GameTheme;
}

export interface GameTheme {
  name: string;
  hex: string;
  isDark: boolean;
  isDefault?: boolean;
}