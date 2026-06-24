import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameSessionService } from 'src/services/game-session.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  feedbackMessage: string = "Félicitations ! Excellent travail.";
  recipeImageUrl: string = "assets/img/recette-defaut.png"; // Image par défaut
  stars: any[] = [];
  chemin:string = "/player/select-recipe";
  patientName: string = '';

  constructor(private router: Router,public gameService: GameSessionService) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;
    
    if (state) {
      if (state['feedbackMessage']) {
        this.feedbackMessage = state['feedbackMessage'];
      }
      // On récupère le chemin de l'image
      if (state['recipeImageUrl']) {
        this.recipeImageUrl = state['recipeImageUrl'];
      }
    }
  }

  ngOnInit(): void {
    // Récupération du prénom via le service
    this.patientName = this.gameService.getPatientName();
    for (let i = 0; i < 15; i++) {
      this.stars.push({
        left: Math.random() * 100 + 'vw',
        animationDuration: (Math.random() * 5 + 5) + 's',
        animationDelay: Math.random() * 3 + 's',
        size: (Math.random() * 1.5 + 0.5) + 'rem'
      });
    }
    if (this.gameService.getIsSoloMode() === false) {
      this.chemin = "/twoplayer";
    }
  }
}