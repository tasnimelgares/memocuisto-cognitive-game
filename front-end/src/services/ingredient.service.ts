import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ingredient } from '../models/ingredient.model';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from '../configs/server.config';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {

  private apiUrl = serverUrl + '/ingredients';

  private ingredients: Ingredient[] = [];
  private ingredientsSubject = new BehaviorSubject<Ingredient[]>(this.ingredients);
  public ingredients$ = this.ingredientsSubject.asObservable();

  constructor(private http: HttpClient) {
    // Au démarrage, on charge les ingrédients (sans patientId par défaut = communs)
    this.loadIngredients();
  }


  public loadIngredients(patientId?: string) {
    let url = this.apiUrl;
    if (patientId) {
        url += `?patientId=${patientId}`;
    }

    this.http.get<Ingredient[]>(url).subscribe((ingredientsFromBack) => {
        // Formate les données (ID, imageUrl, patientId)
        this.ingredients = ingredientsFromBack.map(ing => ({
            ...ing,
            id: String(ing.id),
            patientId: ing.patientId ? String(ing.patientId) : undefined,
            imageUrl: ing.imageUrl || this.getImagePath(ing)
        }));
        
        this.ingredientsSubject.next(this.ingredients);
    });
  }

  // Récupérer tous les ingrédients (version synchrone)
  getAllIngredients(): Ingredient[] {
    return this.ingredients;
  }

  // Basculer l'état "selected" et enregistrer dans le back-end
  toggleSelection(id: string): void {
    const ingredient = this.ingredients.find(i => i.id === id);
    if (ingredient) {
      const updatedIngredient = { ...ingredient, selected: !ingredient.selected };
      
      // On envoie la modification au serveur via PUT
      this.http.put<Ingredient>(`${this.apiUrl}/${id}`, updatedIngredient).subscribe(() => {
        // Une fois confirmé, on met à jour localement
        ingredient.selected = !ingredient.selected;
        this.ingredientsSubject.next([...this.ingredients]);
      });
    }
  }

  // Ajouter un ingrédient via POST
  addIngredient(ingredient: Ingredient) {
    // On envoie l'ingrédient (le back-end générera l'id num)
    this.http.post<Ingredient>(this.apiUrl, ingredient).subscribe((newIng) => {
      const ingredientWithId = { 
        ...newIng,
        id: String(newIng.id), 
        patientId: newIng.patientId ? String(newIng.patientId) : undefined, // On convertit aussi le patientId s'il revient du back
        imageUrl: newIng.imageUrl || this.getImagePath(newIng)
      };
      
      this.ingredients = [...this.ingredients, ingredientWithId];
      this.ingredientsSubject.next(this.ingredients);
    });
  }

  deleteIngredient(ingredientId: string): void {
    const url = `${this.apiUrl}/${ingredientId}`;

    this.http.delete(url).subscribe({
      next: () => {
        this.ingredients = this.ingredients.filter(ing => ing.id !== ingredientId);     
        this.ingredientsSubject.next(this.ingredients);
                
        console.log(`Recette avec l'ID ${ingredientId} supprimée du serveur avec succès !`);
      },
      error: (err) => {
        console.error("Erreur lors de la suppression de la recette :", err);
      }
    });
  }

  // prend en compte le patientId si on veut reset spécifiquement pour un patient
  resetIngredients(patientId?: string): void {
    this.loadIngredients(patientId); // Recharge depuis le serveur
    console.log("Catalogue d'ingrédients réinitialisé !");
  }

  getImagePath(ingredient: Ingredient): string {
    const nomNettoye = ingredient.name
      .toLowerCase()
      .replace(/œ/g, 'oe')
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/'/g, '-')
      .replace(/\s+/g, '-');
    
    const dossier = ingredient.rayon;
    return `assets/img/ingredients/${dossier}/${nomNettoye}.png`;
  }

  ingredientExisteDeja(ingredientName : string): boolean {
    const listeNoms =  this.ingredients.map(ing => ing.name.toLocaleLowerCase());
    return listeNoms.includes(ingredientName);
  }

  getIngredientById(ingredientId: string): Ingredient | undefined{
    return this.ingredients.find(i => i.id == ingredientId);
  }
}