export interface RecipeStep {
  id: number;
  text: string;
  order: number;       // L'ordre officiel de l'étape (1, 2, 3...)
  imgPath?: string;     // Le chemin de l'image
  userOrder?: number;  // (Optionnel) L'ordre choisi par le joueur pendant le jeu
  highlighted?: boolean; // (Optionnel) Pour gérer l'aide visuelle en jeu
}

export interface Recipe {
  id: string;
  name: string;
  category: 'plat' | 'boisson' | 'dessert';
  // On accepte un tableau d'éléments qui peuvent être soit des strings, soit des tableaux de strings.
  ingredientsIds: any[]; 
  steps: RecipeStep[];      
  imageUrl?: string;
  patientId?: string;
}