import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { FormFieldComponent } from 'src/app/collection/form-field/form-field.component';
import { Ingredient } from 'src/models/ingredient.model';
import { IngredientService } from 'src/services/ingredient.service';

@Component({
  selector: 'app-ingredient-form',
  templateUrl: './ingredient-form.component.html',
  styleUrl: './ingredient-form.component.scss'
})
export class IngredientFormComponent implements OnInit {
  ingredientForm!: FormGroup;

  @ViewChild('nameField') nameField!: FormFieldComponent;
  @ViewChild('rayonField') rayonField!: FormFieldComponent;
  @ViewChild('rangementField') rangementField!: FormFieldComponent;
  @ViewChild('ingredientFileInput') ingredientFileInputVariable!: ElementRef;

  @Input() patientId?: string;
  @Input() closeButton: boolean = false;
  @Output() modalClosed = new EventEmitter<boolean>();

  imageIngredientPreview: string | null = null;
  isErrorIngredient: boolean = false;
  feedbackMessageIngredient: string = '';

  rayons = [
    { id: 'frais', label: 'Produits Frais' },
    { id: 'epicerie', label: 'Épicerie' },
    { id: 'fruit-legume', label: 'Fruits & Légumes' },
    { id: 'surgele', label: 'Surgelés' },
    { id: 'boissons', label: 'Boissons'},
    { id: 'boucherie-poissonnerie', label: 'Boucherie - Poissonnerie'},
    { id: 'boulangerie', label: 'Boulangerie'},
    { id: 'epices', label: 'Épices'} 
  ];

  rangementMaison = [
    { id: 'sec', label: 'Placards' },
    { id: 'frais', label: 'Frigo' },
    { id: 'surgele', label: 'Congélateur' },
    { id: 'frais-sec', label: 'Frigo ou Placard' } // option hybride
  ];

  constructor(private fb: FormBuilder, private ingredientService: IngredientService) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.ingredientForm = this.fb.group({
      name: ['', [Validators.required]],
      rayonId: ['', Validators.required],
      rangementId: ['', Validators.required],
      image: [null]
    });
  }

  isTouchedOrDirty(formControl: AbstractControl | null): boolean {
    if (!formControl) return false;
    return formControl.invalid && (formControl.touched || formControl.dirty);
  }

  onSubmit() {
    this.ingredientForm.markAllAsTouched(); 

    if (this.ingredientForm.valid) {
      const formValue = this.ingredientForm.value;

      // Vérification des doublons
      if (this.ingredientService.ingredientExisteDeja(formValue.name.trim().toLowerCase())) {
        this.feedbackMessageIngredient = `L'ingrédient "${formValue.name}" existe déjà. Veuillez vérifier la liste.`;
        this.isErrorIngredient = true;
        return;
      }

      // L'image est requise pour le gameplay visuel
      if (!this.imageIngredientPreview) {
        this.feedbackMessageIngredient = "Une image PNG est requise pour illustrer l'ingrédient.";
        this.isErrorIngredient = true;
        return;
      }

      this.feedbackMessageIngredient = "Enregistrement en cours...";
      this.isErrorIngredient = false;

      const newIngredient: Ingredient = {
        id: '', 
        name: formValue.name,
        selected: false,
        rayon: formValue.rayonId as any,
        imageUrl: this.imageIngredientPreview,
        patientId: this.patientId,
        zoneStockage: formValue.rangementId as 'frais' | 'sec' | 'surgele' | 'frais-sec'
      };

      // Ajout via le service
      this.ingredientService.addIngredient(newIngredient);
      
      this.feedbackMessageIngredient = "Ingrédient enregistré !";

      setTimeout(() => {
        this.resetInputs();
      }, 1500);

    } else {
      this.feedbackMessageIngredient = "Le formulaire est incomplet.";
      this.isErrorIngredient = true;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.ingredientForm.patchValue({ image: file });

      const reader = new FileReader();
      reader.onload = () => this.imageIngredientPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  resetInputs() {
    this.ingredientForm.reset();
    this.feedbackMessageIngredient = '';
    this.imageIngredientPreview = null;

    // Reset des composants enfants
    if (this.nameField) this.nameField.reset();
    if (this.rayonField) this.rayonField.reset();
    if (this.rangementField) this.rangementField.reset();
    
    if (this.ingredientFileInputVariable) {
      this.ingredientFileInputVariable.nativeElement.value = "";
    }
  }

  onClose(){
    this.modalClosed.emit(true);
  }
}