import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ingredient } from 'src/models/ingredient.model';
import { Recipe } from 'src/models/recipe.model';
import { IngredientService } from 'src/services/ingredient.service';
import { PatientService } from 'src/services/patient.service';
import { RecipeService } from 'src/services/recipe.service';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss'
})
export class CatalogueComponent {

  DEBUG: boolean = true;
  @Input() dataType: 'recipe' | 'ingredient' = 'recipe';
  data:any[] = [];
  selectedItem: any = null;

  // Événement envoyé au parent pour ouvrir le formulaire adéquat
  @Output() createRequested = new EventEmitter<'recipe' | 'ingredient'>();

  @Input() filterTerm: string = '';

  // Variables de pagination
  currentPage: number = 1;
  itemsPerPage: number = 10; // 2 lignes de 5 éléments

  private patientSub!: Subscription;
  private dataSub!: Subscription;

  constructor(public ingredientService: IngredientService, public recipeService: RecipeService, private patientService : PatientService) {}

  ngOnInit() {
    this.patientSub = this.patientService.currentPatient$.subscribe(patient => {
      
      const patientId = patient?.id ? String(patient.id) : undefined;
      
      if (this.DEBUG) console.log("Le catalogue a détecté le patient actuel : ", patient);

      this.currentPage = 1;

      if (this.dataType === 'recipe') {
        this.recipeService.loadRecipes(patientId);
      } else {
        this.ingredientService.loadIngredients(patientId);
      }
    });

    if (this.dataType === 'recipe') {
      this.dataSub = this.recipeService.recipes$.subscribe((recipes: Recipe[]) => {
        this.data = recipes;
        this.ajusterPagination();
      });
    } else {
      this.dataSub = this.ingredientService.ingredients$.subscribe((ingredients: Ingredient[]) => {
        this.data = ingredients;
        this.ajusterPagination();
      });
    }
  }

  ngOnDestroy() {
    if (this.patientSub) this.patientSub.unsubscribe();
    if (this.dataSub) this.dataSub.unsubscribe();
  }

  private ajusterPagination() {
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get filteredData(): any[] {
    if (!this.filterTerm) {
      return this.data;
    }
    const cleanTerm = this.normalizeText(this.filterTerm);
    return this.data.filter(item => {
      if (!item.name) return false;
      const cleanItemName = this.normalizeText(item.name);
      return cleanItemName.includes(cleanTerm);
    });
  }
  
  // calcule le nombre total de pages
  get totalPages(): number {
    const totalItemsIncludingPlaceholder = this.filteredData.length + 1;
    return Math.ceil(totalItemsIncludingPlaceholder / this.itemsPerPage);
  }

  // renvoie les éléments de la page actuelle
  get paginatedData(): any[] {
    if (this.currentPage === 1) {
      // sur la page 1 : on laisse la première place libre (0) pour le placeholder, donc on prend les éléments de 0 à 9
      return this.filteredData.slice(0, this.itemsPerPage - 1);
    } else {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage - 1;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredData.slice(startIndex, endIndex);
    }
  }

  pageSuivante() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  pagePrecedente() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  openDetail(item: any) {
    this.selectedItem = item;
  }

  closeDetail() {
    this.selectedItem = null;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    if (this.selectedItem) {
      this.closeDetail();
    }
  }

  openCreateForm() {
    this.createRequested.emit(this.dataType);
    if (this.DEBUG) console.log("bouton ajouter clické",this.dataType);
  }

  deleteElement(element: Recipe | Ingredient): void {
    if (this.dataType === 'recipe') {
      this.recipeService.deleteRecipe(element.id);
    } else {
      this.ingredientService.deleteIngredient(element.id);
    }

    this.closeDetail();
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()                     
      .replace(/œ/g, 'oe')               
      .replace(/Œ/g, 'oe')               
      .normalize('NFD')                 
      .replace(/[\u0300-\u036f]/g, ''); 
  }

}
