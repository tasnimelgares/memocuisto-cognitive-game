import { Component, OnInit } from '@angular/core';
import { Patient } from '../../../models/patient.model';
import { PatientService } from 'src/services/patient.service';
import { ConfigService } from 'src/services/config.service';
import { Router } from '@angular/router';
import { GameSessionService } from 'src/services/game-session.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class ConfigComponent implements OnInit{
  patientActuel: Patient | null = null;
  
  constructor(
    private patientService: PatientService,
    private configService: ConfigService,
    private gameSessionService: GameSessionService,
    private router: Router
  ) {
    // s'abonne au service pour savoir quel est le patient sélectionné
    this.patientService.currentPatient$.subscribe((patient) => {
      this.patientActuel = patient;
    });
  }
  ngOnInit(): void {
    
  }

  goToGame() {
    this.gameSessionService.setPatientName(this.patientActuel!.firstName);
    this.router.navigate(['/homepage'], { 
    });
  }


  // pour debug :
  lancerLaPartie() {
    const parametresFinaux = this.configService.getCurrentConfig();
    console.log(" TEST CONFIG de l'aidant :", parametresFinaux);
  }

}
