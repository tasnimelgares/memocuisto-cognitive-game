import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { Ingredient } from 'src/models/ingredient.model';
import { Location } from '@angular/common';
import { PatientService } from 'src/services/patient.service';


@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss'
})
export class CollectionComponent implements OnInit{
  constructor(private router: Router, private patientService: PatientService, private location: Location){}
    
  DEBUG: boolean = true;

  showRecipe: boolean = true;
  showAddRecipeForm: boolean = false;
  showAddIngredientForm: boolean = false;

  searchQuery: string = '';

  monIngredientSelectionne :Ingredient = {
    "id": "139",
    "name": "Fruits rouges surgelés",
    "selected": false,
    "rayon": "surgele",
    "zoneStockage": "surgele"
  };

  get currentPatientId(): string | undefined {
    const id = this.patientService.currentPatient$.value?.id;
    // Si on a un ID, on le transforme en string (texte), sinon on renvoie undefined
    return id !== undefined ? String(id) : undefined;
  }

  ngOnInit(){}

  toggleDataType(){
    this.showRecipe = !this.showRecipe;
    this.searchQuery = '';
  }

  retourPrecedent(): void {
    this.location.back();
  }

  handleCreation(type: 'recipe' | 'ingredient') {
    if (type === 'recipe') {
      this.showAddRecipeForm = true;
      this.showAddIngredientForm = false;
    } else {
      this.showAddRecipeForm = false;
      this.showAddIngredientForm = true;
    }
    if (this.DEBUG) console.log("addrecipe :", this.showAddRecipeForm, "addIngredient :", this.showAddIngredientForm);
  }

  closeForm(){
    this.showAddRecipeForm = false;
    this.showAddIngredientForm = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    if (this.showAddRecipeForm || this.showAddIngredientForm) {
      this.closeForm();
    }
  }
}