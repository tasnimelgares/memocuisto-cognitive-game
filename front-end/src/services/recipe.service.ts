import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Recipe } from '../models/recipe.model';
import { Ingredient } from 'src/models/ingredient.model';
import { IngredientService } from 'src/services/ingredient.service';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from 'src/configs/server.config';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
    private apiUrl = serverUrl + '/recipes';

    private recipes: Recipe[] = [];
    private recipesSubject = new BehaviorSubject<Recipe[]>(this.recipes);
    public recipes$ = this.recipesSubject.asObservable();

    private allIngredients: Ingredient[] = [];
    private selectedRecipeSubject = new BehaviorSubject<Recipe | null>(null);
    public selectedRecipe$ = this.selectedRecipeSubject.asObservable();

    constructor(private http: HttpClient, private ingredientService: IngredientService) {
        // Au démarrage, on charge les recettes communes (sans patientId)
        this.loadRecipes(); 
        
        this.ingredientService.ingredients$.subscribe(ingredients => {
            this.allIngredients = ingredients;
        });
    }

    public loadRecipes(patientId?: string) {
        let url = this.apiUrl;
        if (patientId) {
            url += `?patientId=${patientId}`;
        }

        this.http.get<Recipe[]>(url).subscribe((recipesFromBack) => {
            this.recipes = recipesFromBack.map(recipe => ({
                ...recipe,
                id: String(recipe.id),
                
                // On gère la conversion des IDs, qu'ils soient simples ou dans un tableau
                ingredientsIds: recipe.ingredientsIds.map(req => {
                    if (Array.isArray(req)) {
                        return req.map(id => String(id));
                    }
                    return String(req);
                }),
                
                patientId: recipe.patientId ? String(recipe.patientId) : undefined, 
                imageUrl: recipe.imageUrl || this.getRecipePath(recipe)
            }));
            
            this.recipesSubject.next(this.recipes);
        });
    }

    resetRecipes(patientId?: string): void {
        this.loadRecipes(patientId); 
        console.log("Catalogue de recettes rechargé depuis le serveur !");
    }

    getAllRecipes(): Observable<Recipe[]> {
        return this.recipes$;
    }

    getRecipesByCategory(category: string): Observable<Recipe[]> {
        return this.recipes$.pipe(
            map(recipes => recipes.filter(r => r.category === category))
        );
    }

    getRecipesByCategoryAndDifficulty(category: string, difficulty: string): Observable<Recipe[]> {
        if (difficulty === 'tout') {
            return this.getRecipesByCategory(category);
        }
        return this.recipes$.pipe(
            map(recipes => recipes.filter(r => {
                const nbIngredients = r.ingredientsIds.length;
                let calculatedDifficulty = '';

                if (nbIngredients <= 4) {
                    calculatedDifficulty = 'facile';
                } else if (nbIngredients >= 5 && nbIngredients <= 6) {
                    calculatedDifficulty = 'moyen';
                } else if (nbIngredients >= 7) {
                    calculatedDifficulty = 'difficile';
                }

                return r.category === category && calculatedDifficulty === difficulty;
            }))
        );
    }

    getRecipeById(id: string): Observable<Recipe|undefined> {
        return this.recipes$.pipe(
            map(recipes => recipes.find(r => r.id === id))
        );
    }

    getRecipeByName(name: string): Observable<Recipe|undefined> {
        return this.recipes$.pipe(
            map(recipes => recipes.find(r => r.name === name))
        );
    }

    setSelectedRecipe(recipe: Recipe): void {
        this.selectedRecipeSubject.next(recipe);
    }

    // fonction qui gère les choix (tableaux) pour afficher le résumé de la recette
    getIngredientsForRecipe(recipeIngredientIds: any[]): Ingredient[] {
        const result: Ingredient[] = [];

        recipeIngredientIds.forEach(req => {
            if (Array.isArray(req)) {
                // C'est un tableau de choix (ex: ["10", "113"])
                // On cherche le premier qui existe dans notre base
                const item = this.allIngredients.find(i => req.includes(String(i.id)));
                if (item && !result.includes(item)) {
                    result.push(item);
                }
            } else {
                // C'est un ID classique
                const item = this.allIngredients.find(i => String(i.id) === String(req));
                if (item && !result.includes(item)) {
                    result.push(item);
                }
            }
        });

        return result;
    }

    addRecipe(newRecipe: Recipe): Observable<Recipe> {
        return this.http.post<Recipe>(this.apiUrl, newRecipe).pipe(
            tap((createdRecipe) => {
                createdRecipe.id = String(createdRecipe.id);
                
                // On gère les ajouts de recettes personnalisées pour éviter les plantages
                createdRecipe.ingredientsIds = createdRecipe.ingredientsIds.map(req => {
                    if (Array.isArray(req)) {
                        return req.map(id => String(id));
                    }
                    return String(req);
                });
                
                this.recipes = [...this.recipes, createdRecipe];
                this.recipesSubject.next(this.recipes);
                
                console.log("Nouvelle recette enregistrée dans le serveur :", createdRecipe);
            })
        );
    }

    deleteRecipe(recipeId: string): void {
        const url = `${this.apiUrl}/${recipeId}`;

        this.http.delete(url).subscribe({
            next: () => {
                this.recipes = this.recipes.filter(recipe => recipe.id !== recipeId);
                
                this.recipesSubject.next(this.recipes);
                
                console.log(`Recette avec l'ID ${recipeId} supprimée du serveur avec succès !`);
            },
            error: (err) => {
                console.error("Erreur lors de la suppression de la recette :", err);
            }
        });
    }

    getRecipePath(recipe : Recipe): string {
        const nomNettoye = recipe.name
        .toLowerCase()
        .replace(/œ/g, 'oe')
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/'/g, '-')
        .replace(/\s+/g, '-');
        
        return 'assets/img/recipes/' + nomNettoye + '.png';
    }

    getNextStepId(): number{
        const allSteps = this.recipes.flatMap(recipe => recipe.steps);
        if (allSteps.length === 0) {
            return 1;
        }
        const maxId = Math.max(...allSteps.map(step => step.id));
        return maxId + 1;
    }

    recetteExisteDeja(recepeName : string): boolean {
    const listeNoms =  this.recipes.map(rec => rec.name.toLocaleLowerCase());
    return listeNoms.includes(recepeName);
  }
}