import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { PatientService } from '../../../services/patient.service';
import { StatsService } from 'src/services/stats.service';
import { Patient } from '../../../models/patient.model';
import { GameResult } from '../../../models/game-result.model'; 
import { NoteService } from '../../../services/note.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {
  patientActuel: Patient | null = null;
  newNote: string = '';
  
  dataHistorique: GameResult[] = [];
  dernierePartie: GameResult | null = null;
  indexSelectionne: number = -1;
  // --- VARIABLES POUR L'AFFICHAGE ---
  
  // Résumé global
  scoreGlobal: number = 0;
  tempsTotalFormate: string = '';

  // Jauges (Aisance et Précision)
  aisanceValeur: number = 0;
  aisanceCouleur: 'green' | 'yellow' | 'red' = 'green';
  aisanceLabel: string = '';

  precisionValeur: number = 0;
  precisionCouleur: 'green' | 'yellow' | 'red' = 'green';
  precisionLabel: string = '';

  // Fatigue
  fatigueValeur: number = 0;
  fatigueCouleur: 'green' | 'yellow' | 'red' = 'green';
  fatigueLabel: string = '';

  // Détails par étape
  scoreEtape1: number = 0;
  scoreEtape2: number = 0;
  scoreEtape3: number = 0;

  aidesEtape1: string[] = [];
  aidesEtape2: string[] = [];
  aidesEtape3: string[] = [];
  
  toutesLesAides: string[] = []; //pour le bloc "Aides utilisées lors de la dernière partie"

  constructor(
    private patientService: PatientService,
    private statsService: StatsService,
    private noteService: NoteService,
    private router: Router 
  ){}

  ngOnInit(): void {
    this.patientService.currentPatient$.subscribe(p => {
      this.patientActuel = p;
      if (this.patientActuel) {
        this.statsService.getStatsByPatientId(this.patientActuel.id!);
      }
    });

    this.statsService.stats$.subscribe(stats => {
      this.dataHistorique = stats;
      
      if (this.dataHistorique.length > 0) {
        this.indexSelectionne = this.dataHistorique.length - 1;
        this.dernierePartie = this.statsService.getDernierePartie();
        
        if (this.dernierePartie) {
          this.mettreAJourAffichage(this.dernierePartie);
        }
      }
      else {
        this.dernierePartie = null;
        this.indexSelectionne = -1;
      }
    });
  }


  retourAccueil(): void {
    this.patientService.setCurrentPatient(null); 
    this.router.navigate(['/']);                 
  }

  //On récup les calculs du service
  mettreAJourAffichage(partie: GameResult) {
    console.log("Màj des stats avec la partie :", partie);
    const resume = this.statsService.getStatsResume(partie);
    
    this.scoreGlobal = resume.score;
    this.aisanceValeur = resume.aisance;
    this.precisionValeur = resume.precision;
    this.fatigueValeur = resume.fatigue;

    this.tempsTotalFormate = resume.tempsFormate;

    this.scoreEtape1 = resume.scoreE1;
    this.scoreEtape2 = resume.scoreE2;
    this.scoreEtape3 = resume.scoreE3;

    this.aidesEtape1 = [...new Set(partie.etape1.aides)];
    this.aidesEtape2 = [...new Set(partie.etape2.aides)];
    this.aidesEtape3 = [...new Set(partie.etape3.aides)];

    this.toutesLesAides = [...new Set(this.statsService.getToutesLesAides(partie))];

    this.calculerCouleursJauges();
  }

  calculerCouleursJauges() {
    // --- Logique Aisance ---
    if (this.aisanceValeur >= 70) {
      this.aisanceCouleur = 'green';
      this.aisanceLabel = 'Navigation fluide';
    } else if (this.aisanceValeur >= 40) {
      this.aisanceCouleur = 'yellow';
      this.aisanceLabel = 'Hésitations';
    } else {
      this.aisanceCouleur = 'red';
      this.aisanceLabel = 'Difficulté de repérage';
    }

    // --- Logique Précision---
    if (this.precisionValeur >= 80) {
      this.precisionCouleur = 'green';
      this.precisionLabel = 'Coordination correcte';
    } else if (this.precisionValeur >= 50) {
      this.precisionCouleur = 'yellow';
      this.precisionLabel = 'Erreurs modérées';
    } else {
      this.precisionCouleur = 'red';
      this.precisionLabel = 'Erreurs fréquentes';
    }

    // --- Logique Fatigue ---
    if (this.fatigueValeur < 30) {
      this.fatigueCouleur = 'green';
      this.fatigueLabel = 'Stable';
    } else if (this.fatigueValeur < 40) {
      this.fatigueCouleur = 'yellow';
      this.fatigueLabel = 'Fatigue légère';
    } else if (this.fatigueValeur < 60) {
      this.fatigueCouleur = 'yellow';
      this.fatigueLabel = 'Fatigue marquée';
    } else {
      this.fatigueCouleur = 'red';
      this.fatigueLabel = 'Fatigue élevée';
    }
  }

  saveNote() {
  if (this.newNote.trim()) {
      this.noteService.ajouterNote(this.newNote);
      console.log("Note envoyée au service :", this.newNote);
      this.newNote = '';
    }
  }

  // gestion menu déroulant dates
  changerPartie(nouvelIndex: number) {
    this.indexSelectionne = nouvelIndex;
    if (this.dataHistorique[this.indexSelectionne]) {
      this.dernierePartie = this.dataHistorique[this.indexSelectionne];
      this.mettreAJourAffichage(this.dernierePartie); 
    }
  }
}