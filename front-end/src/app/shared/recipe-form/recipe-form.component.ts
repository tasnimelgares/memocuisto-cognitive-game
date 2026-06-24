import { Component, EventEmitter, OnInit, Output, ViewChild, Input, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { FormFieldComponent } from 'src/app/collection/form-field/form-field.component';
import { SelectIngredientComponent } from 'src/app/twoplayer/select-ingredient/select-ingredient.component';
import { SelectStepsComponent } from 'src/app/twoplayer/select-steps/select-steps.component';
import { Ingredient } from 'src/models/ingredient.model';
import { Recipe } from 'src/models/recipe.model';
import { RecipeService } from 'src/services/recipe.service';

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.scss'
})
export class RecipeFormComponent implements OnInit{
  recipeForm!: FormGroup;
  @ViewChild('nameField') nameField!: FormFieldComponent;
  @ViewChild('categoryField') categoryField!: FormFieldComponent;
  @ViewChild('ingredientsField') ingredientsField!: SelectIngredientComponent;
  @ViewChild('stepsField') stepsField!: SelectStepsComponent;
  @ViewChild('recipeFileInput') recipeFileInput!: ElementRef<HTMLInputElement>;

  @Input() patientId?: string;
  @Input() closeButton: boolean = false;

  @Output() recipeSaved = new EventEmitter<boolean>();
  @Output() modalClosed = new EventEmitter<boolean>();
  
  imageRecipePreview: string | null = null;
  categories = [
    { id: 'plat', label: 'Plat' },
    { id: 'boisson', label: 'Boisson' },
    { id: 'dessert', label: 'Dessert' }
  ];
  currentIngredients : Ingredient[] = [];

  isErrorRecipe:boolean = false;
  feedbackMessageRecipe:string = '';

  constructor(private fb: FormBuilder,private recipeService: RecipeService) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.recipeForm = this.fb.group({
      name: ['', [Validators.required]],
      categoryId: ['', Validators.required],
      image: [null, Validators.required],
      ingredients: [[], Validators.required], 
      steps: [[], Validators.required]      
    });
  }

  isTouchedOrDirty(formControl: AbstractControl | null): boolean {
    if (!formControl) return false;
    return formControl.invalid && (formControl.touched || formControl.dirty);
  }

  onSubmit() {
    this.recipeForm.markAllAsTouched(); 
    if (this.recipeForm.valid) {
      const formValue = this.recipeForm.value;


      if (this.recipeService.recetteExisteDeja(formValue.name.trim().toLocaleLowerCase())) {
        this.feedbackMessageRecipe = `Le nom de recette "${formValue.name}" existe déjà. Veuillez en choisir un autre.`;
        this.isErrorRecipe = true;
        return; // On arrête l'exécution ici, le formulaire n'est pas envoyé
      }

      // On indique que ça charge
      this.feedbackMessageRecipe = "Enregistrement en cours...";
      this.isErrorRecipe = false;

      const nouvelleRecette: Recipe = {
        id: '', // généré par le back-end
        name: formValue.name,
        category: formValue.categoryId,
        ingredientsIds: formValue.ingredients.map((ing: Ingredient) => ing.id),
        steps: formValue.steps,
        imageUrl: this.imageRecipePreview || '/assets/img/recipes/default.png',
        patientId: this.patientId
      };

      // On s'abonne pour attendre la réponse du back-end
      this.recipeService.addRecipe(nouvelleRecette).subscribe({
        next: (completeRecipe: Recipe) => {
          this.feedbackMessageRecipe = "Recette enregistrée !";
          console.log("Recette complète générée par le serveur :", completeRecipe);

          this.recipeService.setSelectedRecipe(completeRecipe);
          this.recipeSaved.emit(true);

          setTimeout(() => {
            this.resetInputs();
          }, 1500);
        },
        error: (err: any) => { 
          this.feedbackMessageRecipe = "Erreur de connexion au serveur.";
          this.isErrorRecipe = true;
          console.error(err);
        }
      });
    } 
    else {
      this.feedbackMessageRecipe = "Le formulaire est incomplet.";
      this.isErrorRecipe = true;
    }
  }

  onClose(){
    this.modalClosed.emit(true);
  }

  onFileRecipeSelected(event: any) {
    const file = event.target.files[0];
    const imageControl = this.recipeForm.get('image');
    if (file) {
      imageControl?.patchValue(file); 
      imageControl?.markAsTouched(); 
      imageControl?.markAsDirty();   
      
      const reader = new FileReader();
      reader.onload = () => this.imageRecipePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
    else {
      imageControl?.patchValue(null); 
      imageControl?.markAsTouched(); 
      this.imageRecipePreview = null;
    }
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")                  
      .replace(/[\u0300-\u036f]/g, "")    
      .replace(/[^a-z0-9 ]/g, "")         
      .trim()                             
      .replace(/\s+/g, '-');              
  }

  resetInputs(){
    this.currentIngredients = [];
    this.recipeForm.reset();
    this.feedbackMessageRecipe = '';
    this.imageRecipePreview = null;
    this.categoryField.reset();
    this.nameField.reset();
    this.stepsField.reset();
    this.ingredientsField.reset();
  }

  passerALImage(event: Event): void {
    // On empêche le formulaire de se soumettre
    event.preventDefault();

    // On donne le focus au bouton "Choisir un fichier"
    if (this.recipeFileInput) {
      this.recipeFileInput.nativeElement.focus();
      
      // Si on veut que la fenêtre pour choisir l'image s'ouvre 
      // toute seule quand on fait Entrée: 
      // this.recipeFileInput.nativeElement.click(); 
    }
  }

  passerAuxIngredients(event: Event): void {
    const ingredientInput = document.querySelector('app-select-ingredient input') as HTMLInputElement;
    if (ingredientInput) {
      ingredientInput.focus();
    }
  }
}