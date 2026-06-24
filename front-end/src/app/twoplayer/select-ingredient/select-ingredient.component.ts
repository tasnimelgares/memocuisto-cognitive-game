import { Component, OnInit, Output, EventEmitter, Input, ElementRef, HostListener } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { IngredientService } from 'src/services/ingredient.service';
import { Ingredient } from 'src/models/ingredient.model';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';

@Component({
  selector: 'app-select-ingredient',
  templateUrl: './select-ingredient.component.html',
  styleUrls: ['./select-ingredient.component.scss']
})
export class SelectIngredientComponent implements OnInit {
  @Output() ingredientAdded = new EventEmitter<Ingredient>();
  @Output() ingredientDeleted = new EventEmitter<Ingredient>();

  searchControl = new FormControl('');
  filteredIngredients$!: Observable<Ingredient[]>;
  
  selectedIngredients: Ingredient[] = [];
  @Input() control!: AbstractControl | null;
  isInputFocused = false;

  readonly MAX_INGREDIENTS: number = 15;

  constructor(private ingredientService: IngredientService, private elementRef: ElementRef) {}

  ngOnInit() {
    this.filteredIngredients$ = combineLatest([
      this.ingredientService.ingredients$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([ingredients, term]) => {
        if (!this.isInputFocused && !term) {
          return [];
        }

        let filterValue = (term || '').toLowerCase().replace(/œ/g, 'oe');
        
        const filtered = ingredients.filter(ing => {
          let ingNameClean = ing.name.toLowerCase().replace(/œ/g, 'oe');
          const matchesSearch = filterValue ? ingNameClean.startsWith(filterValue) : true;
          const isAlreadySelected = this.selectedIngredients.some(s => s.id === ing.id);
          return matchesSearch && !isAlreadySelected;
        });

        return filtered.sort((a, b) => {
          const rayonA = (a.rayon || '').toLowerCase();
          const rayonB = (b.rayon || '').toLowerCase();

          if (rayonA !== rayonB) {
            return rayonA.localeCompare(rayonB);
          }
          return a.name.localeCompare(b.name);
        });
      })
    );
  }
  
  get formControl(): FormControl {
    return this.control as FormControl;
  }

  addIngredient(ing: Ingredient) {
    // on bloque si on est à 15 ou plus
    if (this.selectedIngredients.length >= this.MAX_INGREDIENTS) return;

    this.selectedIngredients.push(ing);
    this.formControl.setValue(this.selectedIngredients);
    this.formControl.markAsDirty();
    this.searchControl.setValue('');
  }

  removeIngredient(ing: Ingredient) {
    this.selectedIngredients = this.selectedIngredients.filter(i => i.id !== ing.id);
    this.formControl.setValue(this.selectedIngredients);
    this.searchControl.setValue('');
  }

  onFocus() {
    // On empêche d'ouvrir la liste si la limite est atteinte
    if (this.selectedIngredients.length >= this.MAX_INGREDIENTS) return;
    
    this.isInputFocused = true;
    this.searchControl.setValue(this.searchControl.value, { emitEvent: true });
  }

  @HostListener('document:click', ['$event'])
  clickOut(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isInputFocused = false;
      this.searchControl.setValue('');
    }
  }

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

  getRayonColor(rayon: string): string {
    return this.rayonCouleurs[rayon] || this.rayonCouleurs['Autre'];
  }

  reset(){
    this.selectedIngredients = [];
    this.formControl.reset('');
  }

  closeDropdown() {
    this.isInputFocused = false;
    this.searchControl.setValue('');
  }

  onEnter(event: Event) {
    event.preventDefault();
    
    // on bloque l'ajout par touche "Entrée" si la limite est atteinte
    if (this.selectedIngredients.length >= this.MAX_INGREDIENTS) return;

    const currentTerm = this.searchControl.value || '';
    
    this.ingredientService.ingredients$.pipe(take(1)).subscribe(ingredients => {
      let filterValue = currentTerm.toLowerCase().replace(/œ/g, 'oe');
      
      const filtered = ingredients.filter(ing => {
        let ingNameClean = ing.name.toLowerCase().replace(/œ/g, 'oe');
        const matchesSearch = filterValue ? ingNameClean.startsWith(filterValue) : true;
        const isAlreadySelected = this.selectedIngredients.some(s => s.id === ing.id);
        return matchesSearch && !isAlreadySelected;
      });

      const sorted = filtered.sort((a, b) => {
        const rayonA = (a.rayon || '').toLowerCase();
        const rayonB = (b.rayon || '').toLowerCase();
        if (rayonA !== rayonB) {
          return rayonA.localeCompare(rayonB);
        }
        return a.name.localeCompare(b.name);
      });

      if (sorted.length > 0) {
        this.addIngredient(sorted[0]);
        this.isInputFocused = false; 
      }
    });
  }
}