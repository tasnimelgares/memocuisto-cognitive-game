import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Recipe } from 'src/models/recipe.model';
import { GameSessionService } from 'src/services/game-session.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/services/config.service';
import { GameConfig } from 'src/models/game-config.model';
import { PatientService } from './../../../services/patient.service';

@Component({
  selector: 'app-guess-recipe',
  templateUrl: './guess-recipe.component.html',
  styleUrl: './guess-recipe.component.scss'
})
export class GuessRecipeComponent implements OnInit, OnDestroy {
  currentRecipe!: Recipe;
  lettersGuessed: string[] = [];
  recipeLetters!: string[];
  feedbackMessage:string = '';
  feedbackColor:string='';
  isGameWon: boolean = false;

  gameConfig!: GameConfig;
  private configSub!: Subscription;

  // Structure du clavier AZERTY
  readonly keyboardRowsAzerty = [
    ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
    ['w', 'x', 'c', 'v', 'b', 'n']
  ];

  // Structure du clavier Alphabétique
  readonly keyboardRows = [
    ['a','b','c','d','e','f','g','h','i'],
    ['j','k','l','m','n','o','p','q','r'],
    ['s','t','u','v','w','x','y','z']
  ];

  constructor(public gameService: GameSessionService,private configService: ConfigService,private router: Router, private patientService: PatientService) {}

  ngOnInit() {
    this.configSub = this.configService.config$.subscribe(config => {
      this.gameConfig = config;
    });
    this.currentRecipe = this.gameService.getCurrentRecipe()!;
    this.recipeLetters = this.currentRecipe.name.split('');
  }

  ngOnDestroy(): void {
    if (this.configSub) {
      this.configSub.unsubscribe();
    }
  }

  // --- ÉCOUTE DU CLAVIER PHYSIQUE ---
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isGameWon) return;
    const key = event.key;

    const frenchLetterRegex = /^[a-zàâçéèêëîïôûùæœ]$/i;

    // On vérifie si c'est bien une seule lettre (a-z)
    if (key.length === 1 && key.toLocaleLowerCase().match(frenchLetterRegex)) {
      this.onKeyPress(this.normalize(key));
    } 
  }

  // --- LOGIQUE COMMUNE (CLIQUE OU TOUCHE) ---
  onKeyPress(letter: string) {
    if (this.isGameWon || letter === ' ') { return; }
    const cleanLetter = this.normalize(letter);
    if (!this.lettersGuessed.includes(cleanLetter)) {
      this.lettersGuessed.push(cleanLetter);

      // On vérifie si la lettre est présente dans la recette
      const isCorrect = this.recipeLetters.some(l => 
        this.normalize(l) === cleanLetter
      );
      
      this.showFeedbackMessage(isCorrect);

      if (this.checkWinCondition()) {
        this.isGameWon = true;
        this.handleWin();
      }
    }
  }

  // --- VERIFICATION LETTRE ---
  isLetterFound(char: string): boolean {
    // Si c'est un espace, on l'affiche toujours
    if (char === ' ') return true;
    // On vérifie si la lettre est dans le tableau des lettres devinées
    // On utilise toLowerCase() pour être sûr que 'A' match avec 'a'
    return this.lettersGuessed.some(guessed => 
      this.normalize(guessed) === this.normalize(char)
    );
  }


  // --- MESSAGES D'ENCOURAGEMENTS ---
  showFeedbackMessage(isCorrect:boolean){
    if (isCorrect){
      this.feedbackMessage = "Bravo, c'est correct !";
      this.feedbackColor ="var(--couleur-succes)";
    }
    else{
      this.feedbackMessage = "Presque, réessaie encore !";
      this.feedbackColor ="var(--couleur-erreur)";
    }
  }

  // --- VERIFICATION MOT ---
  checkWinCondition(): boolean {
    return this.recipeLetters.every(char => 
      char === ' ' || this.lettersGuessed.includes(this.normalize(char))
    );
  }

  // --- EN CAS DE VICTOIRE ---
  handleWin() {
    this.feedbackMessage = "Félicitations ! Vous avez trouvé la recette ! 🎉";
    this.feedbackColor = "var(--couleur-defaut)";

    const currentRecipe = this.gameService.getCurrentRecipe();
    let recipeImage: string = "assets/img/recette-defaut.png";

    if (currentRecipe) {
      recipeImage = (currentRecipe as any).imageUrl || recipeImage;
    }

    // REDIRECTION APRÈS 3 SECONDES (pour laisser le temps de lire le succès)
    setTimeout(() => {
      this.router.navigate(['/success'], { 
        state: { 
          feedbackMessage: "Bravo, Vous avez gagné ensemble !",
          recipeImageUrl: recipeImage
        } 
      }); 
    }, 3000);
  }

  // Transforme "é" en "e", "ç" en "c", etc.
  normalize(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  // --- GESTION DE L'INDICE ---

  // Cherche la première lettre de la recette qui n'a pas encore été devinée
  private getFirstUnrevealedLetter(): string | undefined {
    const unrevealed = this.recipeLetters.find(char => 
      char !== ' ' && !this.lettersGuessed.includes(this.normalize(char))
    );
    return unrevealed ? this.normalize(unrevealed) : undefined;
  }

  // Révèle une seule lettre manquante
  aideLettre(): void {
    const letterToReveal = this.getFirstUnrevealedLetter();
    
    if (letterToReveal) {
      this.lettersGuessed.push(letterToReveal);
      
      this.feedbackMessage = `💡 Indice : La lettre '${letterToReveal.toUpperCase()}' a été dévoilée !`;
      this.feedbackColor = "var(--couleur-info)"; 

      // On vérifie si par hasard cette aide lui a fait gagner la partie
      if (this.checkWinCondition()) {
        this.handleWin();
      }
    }
  }

  // --- RETOUR VISUEL DU CLAVIER ---
  
  // Vérifie si la lettre a été jouée ET est présente dans la recette
  isLetterCorrect(letter: string): boolean {
    const cleanLetter = this.normalize(letter);
    return this.lettersGuessed.includes(cleanLetter) && 
           this.recipeLetters.some(l => this.normalize(l) === cleanLetter);
  }

  // Vérifie si la lettre a été jouée ET n'est PAS dans la recette
  isLetterWrong(letter: string): boolean {
    const cleanLetter = this.normalize(letter);
    return this.lettersGuessed.includes(cleanLetter) && 
           !this.recipeLetters.some(l => this.normalize(l) === cleanLetter);
  }

  get flouActuel(): number {
    if (this.isGameWon) return 0; 
    const isVisuallyImpaired = this.patientService.currentPatient$.getValue()?.accessibility?.isVisuallyImpaired;
    // on éclaircit l'indice + vite dans le cas ou le patient est malvoyant
    const pasDeDefloutage = isVisuallyImpaired ? 5 : 1;
    return Math.max(0, 20 - (this.lettersGuessed.length * pasDeDefloutage));
  }
}