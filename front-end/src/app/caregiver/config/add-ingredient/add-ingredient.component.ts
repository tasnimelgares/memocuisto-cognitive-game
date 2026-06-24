import { Component } from '@angular/core';

@Component({
  selector: 'app-add-ingredient',
  templateUrl: './add-ingredient.component.html',
  styleUrl: './add-ingredient.component.scss'
})
export class AddIngredientComponent {

  ingredientName: string = '';
  selectedRayon: string = 'epicerie'; // Valeur par défaut
  selectedRangement: string = 'placard';
  imagePreview: string | null = null;
  
 
  feedbackMessage: string = '';
  isError: boolean = false;

  // Liste des rayons disponibles
  rayons = [
    { id: 'frais', label: 'Produits Frais' },
    { id: 'epicerie', label: 'Épicerie' },
    { id: 'fruit-legume', label: 'Fruits & Légumes' },
    { id: 'surgele', label: 'Surgelés' },
    { id: 'boissons', label: 'Boissons' },
    { id: 'boucheriepoissonerie', label: 'Boucherie/poissonerie' },
    { id: 'boulangerie', label: 'Boulangerie' },
    { id: 'epices', label: 'Epices' }
    
  ];

  // Quand l'utilisateur choisit une image sur son ordinateur
  onFileSelected(event: any) {
    const file = event.target.files[0];
    
    if (file) {
      // FileReader permet de lire le fichier pour en faire un aperçu
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result; // On stocke l'image pour l'afficher
      };
      reader.readAsDataURL(file);
    }
  }

  // Quand l'utilisateur clique sur "Ajouter"
  ajouterIngredient() {
    // On vérifie que tout est rempli
    if (!this.ingredientName.trim() || !this.imagePreview) {
      this.isError = true;
      this.feedbackMessage = "Veuillez remplir le nom et ajouter une image.";
      return;
    }

    // SIMULATION DE L'AJOUT
    // plus tard on fera un this.http.post() vers le backend ici.
    console.log("Nouvel ingrédient prêt pour le backend :", {
      name: this.ingredientName,
      rayon: this.selectedRayon,
      image: "..." 
    });

    // Message de succès et remise à zéro
    this.isError = false;
    this.feedbackMessage = `L'ingrédient "${this.ingredientName}" a bien été ajouté au rayon !`;
    
    // On vide le formulaire
    setTimeout(() => {
      this.ingredientName = '';
      this.imagePreview = null;
      this.feedbackMessage = '';
    }, 3000);
  }
}
