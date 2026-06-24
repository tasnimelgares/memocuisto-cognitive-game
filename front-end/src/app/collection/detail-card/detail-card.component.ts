import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Recipe, RecipeStep } from 'src/models/recipe.model';
import { Ingredient } from 'src/models/ingredient.model';
import { IngredientService } from 'src/services/ingredient.service';

@Component({
  selector: 'app-detail-card',
  templateUrl: './detail-card.component.html',
  styleUrls: ['./detail-card.component.scss']
})
export class DetailCardComponent {

  // élément à afficher
  @Input() item: Recipe | Ingredient | null = null;
  
  // type permettant de savoir comment caster et afficher les données
  @Input() type: 'recipe' | 'ingredient' = 'recipe';

  // event pour fermer la modale
  @Output() close = new EventEmitter<void>();

  // event pour notifier le parent qu'un élément doit être supprimé
  @Output() deleteConfirm = new EventEmitter<Recipe | Ingredient>();

  showConfirmDelete: boolean = false;

  categoryCouleurs: { [key: string]: string } = {
    'plat': '#c8e6c9',         
    'boisson': '#bbdefb',         
    'dessert': '#f6cae2'
  };

  rayonCouleurs: { [key: string]: string } = {
    'frais': '#d9edf0', 
    'epicerie': '#fff2cc',          
    'fruit-legume': '#c8e6c9',         
    'surgele': '#bbdefb',         
    'boissons': '#e8f5e9',
    'boucherie-poissonnerie': '#f6cae2',
    'boulangerie':'#fff3e0',          
    'epices':'#ffccbc'
  };

  rangementCouleurs: { [key: string]: string } = {
    'frais': '#d9edf0', 
    'sec': '#fff2cc',          
    'surgele': '#bbdefb',         
  };

  rayonLabel: { [key: string]: string } = {
    'frais': 'Frais', 
    'epicerie': 'Épicerie',          
    'fruit-legume': 'Fruits et légumes',         
    'surgele': 'Surgelés',         
    'boissons': 'Boissons',
    'boucherie-poissonnerie': 'Boucherie - Poissonnerie',
    'boulangerie':'Boulangerie',          
    'epices':'Épices'
  };

  rangementLabel: { [key: string]: string } = {
    'frais': 'Frigo', 
    'surgele': 'Congélateur',         
    'sec': 'Placard',
    'frais-sec': 'Placard - Frigo'
  };

  constructor(private ingredientService: IngredientService) {}

  get recipe(): Recipe | null {
    return this.type === 'recipe' ? this.item as Recipe : null;
  }

  get ingredient(): Ingredient | null {
    return this.type === 'ingredient' ? this.item as Ingredient : null;
  }

  get recipeIngredients(): Ingredient[] {
    if (!this.recipe || !this.recipe.ingredientsIds) return [];

    return this.recipe.ingredientsIds
      .map(id => this.ingredientService.getIngredientById(String(id)))
      .filter((ing): ing is Ingredient => !!ing); // si c'est un ingrédient  !!ing = true un garde sinon !!=false on enlève
  }

  get orderedRecipeSteps(): RecipeStep[] {
    if (!this.recipe || !this.recipe.steps) return [];

    return [...this.recipe.steps].sort((r1, r2) => r1.order - r2.order);
  }

  get modalQuestionText(): string {
    const typeLabel = this.type === 'recipe' ? 'cette recette' : 'cet ingrédient';
    return `Êtes-vous sûr de vouloir supprimer définitivement ${typeLabel} "${this.item?.name}" ?`;
  }

  cancelDelete(): void {
    this.showConfirmDelete = false;
  }

  confirmDelete(): void {
    if (this.item) {
      console.log("confirm sent");
      this.deleteConfirm.emit(this.item);
    }
    this.showConfirmDelete = false;
  }

  getCategoryColor(rayon: string): string {
    return this.categoryCouleurs[rayon] || '#e2e8f0'; 
  }

  getRayonColor(rayon: string): string {
    return this.rayonCouleurs[rayon] || '#e2e8f0'; 
  }

  getRayonLabel(rayon :string): string {
    return this.rayonLabel[rayon];
  }

  getRangementColor(rangement :string): string {
    return this.rangementCouleurs[rangement] || '#edd5e9';
  }

  getRangementLabel(rangement :string): string {
    return this.rangementLabel[rangement];
  }

  onClose(): void {
    this.close.emit();
  }

  onDelete(): void {
    this.showConfirmDelete = true;
  }
}