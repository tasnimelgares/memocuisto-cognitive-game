import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { GameConfig } from 'src/models/game-config.model';
import { Ingredient } from 'src/models/ingredient.model';
import { IngredientService } from 'src/services/ingredient.service';
import { RecipeService } from 'src/services/recipe.service';
import { Recipe } from 'src/models/recipe.model';
import { GameSessionService } from 'src/services/game-session.service';
import { PatientService } from 'src/services/patient.service';

@Component({
  selector: 'app-twoplayer',
  templateUrl: './twoplayer.component.html',
  styleUrl: './twoplayer.component.scss'
})
export class TwoplayerComponent implements OnInit{
  config!: GameConfig;

  // pour les couleur de bouton: 
  alreadyclicked:boolean = false;

  // Type de choix recette
  showExistingRecipeList: boolean = false;
  showAddRecipeForm: boolean = false;

  showMemoriseIngredient = false;

  @ViewChild('ingredientFileInput') ingredientFileInputVariable!: ElementRef;

  // Variables pour l'ajout d'ingrédient
  ingredientName: string = '';
  selectedRayon: string = 'epicerie';
  selectedRangement: string = 'sec';
  imageIngredientPreview: string | null = null;
  feedbackMessageIngredient: string = '';
  isErrorIngredient: boolean = false;
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
    { id: 'placard', label: 'Placards' },
    { id: 'frigo', label: 'Frigo' },
    { id: 'congelateur', label: 'Congélateur' },
    { id: 'frais-sec', label: 'Frigo ou Placard' }
  ];

  get currentPatientId(): string | undefined {
    const id = this.patientService.currentPatient$.value?.id;
    // Si on a un ID, on le transforme en string (texte), sinon on renvoie undefined
    return id !== undefined ? String(id) : undefined;
  }

  constructor(private configService: ConfigService,
    private ingredientService: IngredientService,
    private recipeService: RecipeService,
    private gameService: GameSessionService,
    private patientService: PatientService) {}

  ngOnInit() {
    this.configService.config$.subscribe(c => this.config = c);
    this.gameService.setGameMode(false);
    this.recipeService.loadRecipes(this.currentPatientId);
    this.ingredientService.loadIngredients(this.currentPatientId);
  }

  // --- LOGIQUE CHOIX RECETTE ---
  toggleAlreadyExist() { 
    this.showExistingRecipeList = true;
    this.configService.updateConfig({ personnaliseActif: false }); 
    this.showAddRecipeForm = false;
    this.alreadyclicked = true;
  }
  togglePersonnalise() { 
    this.configService.updateConfig({ personnaliseActif: true }); 
    this.showAddRecipeForm = true; 
    this.showExistingRecipeList = false;
    this.alreadyclicked = true;
  }

  // si on a ajouté une recette on cache l'interface d'ajour pour montrer la liste de recettes
  onRecipeSuccess(recipeSaved:boolean){
    if (recipeSaved) {
      setTimeout(()=> {
        this.showAddRecipeForm=false;
        this.showExistingRecipeList=true;
      },2500);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.ingredientName.trim()) {
      // 1. On prépare le nouveau nom
      const extension = file.name.split('.').pop();
      const nameSlug = this.slugify(this.ingredientName); // "Crème Brûlée" -> "creme-brulee"
      const nouveauNom = `${nameSlug}.${extension}`;

      // 2. On crée le fichier renommé
      const renamedFile = new File([file], nouveauNom, { type: file.type });

      console.log("Fichier prêt :", renamedFile.name);

      // 3. Lecture pour l'aperçu
      const reader = new FileReader();
      reader.onload = (e: any) => this.imageIngredientPreview = e.target.result;
      reader.readAsDataURL(renamedFile);
    } else if (!this.ingredientName.trim()) {
      alert("Veuillez d'abord saisir le nom de l'ingrédient pour renommer l'image.");
      event.target.value = ''; // Reset l'input file
    }
  }

  ajouterIngredient() {
    if (!this.ingredientName.trim() || !this.imageIngredientPreview) {
      this.isErrorIngredient = true;
      this.feedbackMessageIngredient = "Veuillez remplir tous les champs.";
      return;
    }

    if (this.ingredientService.ingredientExisteDeja(this.ingredientName.trim())){
      this.isErrorIngredient = true;
      this.feedbackMessageIngredient = "Un ingrédient du même nom existe déjà. Vérifiez si l'ingrédient que vous souhaitez ajouter n'est pas déjà existant.";
      return;
    }
    this.isErrorIngredient = false;

    // creation de l'ingrédient
    const newIngredient: Ingredient = {
      id: '', // Le service va l'écraser avec le bon numéro
      name: this.ingredientName,
      selected: false,
      rayon: this.selectedRayon as any,
      imageUrl: this.imageIngredientPreview,
      patientId: this.currentPatientId,
      zoneStockage: this.selectedRangement as 'frais' | 'sec' | 'surgele' | 'frais-sec'
    };

    // ajout à la liste
    this.ingredientService.addIngredient(newIngredient);

    this.feedbackMessageIngredient = `L'ingrédient "${this.ingredientName}" a bien été ajouté !`;

    setTimeout(() => {
      this.ingredientName = '';
      this.imageIngredientPreview = null;
      this.feedbackMessageIngredient = '';
      if (this.ingredientFileInputVariable) {
        this.ingredientFileInputVariable.nativeElement.value = "";
      }
    }, 3000);
  }

  //pour test le service juste : 
  testerConsole() {
    const configActuelle = this.configService.getCurrentConfig();
    console.log("TEST AIDANT - CONFIGURATION PRÊTE :", configActuelle);
  }

  resetIngredient() {
    this.ingredientService.resetIngredients();
  }

  resetRecipes(){
    this.recipeService.resetRecipes();
  }

  // Quand on clique sur une recette existante
  onRecipeClick(recipeClicked: Recipe){
    this.showMemoriseIngredient = true;
    this.recipeService.setSelectedRecipe(recipeClicked);
    this.recipeService.selectedRecipe$.subscribe(recipe => {
      console.log("Contenu de la recette :", recipe);
    });
  }

  // Quand on quitte le détail d'une recette existante
  closePopUpRecipe(){
    this.showMemoriseIngredient = false;
    this.recipeService.selectedRecipe$.subscribe(recipe => {
      console.log("Contenu de la recette :", recipe);
    });
  }

  // pour normaliser le nom des images
  slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")                   // Décompose les caractères accentués (é -> e + ´)
    .replace(/[\u0300-\u036f]/g, "")    // Supprime les accents
    .replace(/[^a-z0-9 ]/g, "")         // Supprime tout ce qui n'est pas lettre, chiffre ou espace
    .trim()                             // Enlève les espaces au début et à la fin
    .replace(/\s+/g, '-');              // Remplace les espaces par des tirets
  }
}
