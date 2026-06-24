import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router'; 
import { GameSessionService } from 'src/services/game-session.service';
import { PatientService } from 'src/services/patient.service';
import { CaregiverService } from 'src/services/caregiver.service'; 
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy {

  isPatientSelected: boolean = false;
  showModal: boolean = false;
  
  // Variables pour la modale de mot de passe
  showPasswordModal: boolean = false;
  caregiverPassword: string = '';
  passwordError: string = '';
  isPasswordVisible: boolean = false; 

  patients: Patient[] = [];
  private subscription: Subscription = new Subscription();
  defaultImage = 'assets/img/patient-defaut.png';

  constructor(
    private gameSessionService: GameSessionService,
    private patientService: PatientService,
    private caregiverService: CaregiverService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.patientService.currentPatient$.value) {
      this.isPatientSelected = true;
    }

    this.subscription = this.patientService.patients$.subscribe((patientsList) => {
      this.patients = patientsList;
    });
    this.patientService.getPatients();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  // Méthodes pour la modale de mot de passe
  openPasswordModal(): void {
    this.showPasswordModal = true;
    this.caregiverPassword = ''; 
    this.passwordError = '';     
    this.isPasswordVisible = false; 
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  submitPasswordVerification(): void {
    this.passwordError = ''; 

    this.caregiverService.verifyPassword(this.caregiverPassword).subscribe({
      next: (response) => {
        if (response.success) { 
          this.closePasswordModal();
          this.router.navigate(['/choix-patient']); 
        } else {
          this.passwordError = "Mot de passe incorrect.";
          this.caregiverPassword = ''; 
        }
      },
      error: (err) => {
        // On vide le champ du mot de passe dans tous les cas d'erreur
        this.caregiverPassword = ''; 

        // Si l'erreur vient d'un refus d'autorisation (ex: 401 ou 403)
        if (err.status === 401 || err.status === 403) {
          this.passwordError = "Mot de passe incorrect.";
        } 
        // Si c'est un problème de réseau (0) ou une erreur serveur (500)
        else {
          this.passwordError = "Impossible de se connecter au serveur. Veuillez réessayer plus tard.";
        }
        
        // pour debug
        console.error("Erreur de vérification du mot de passe :", err);
      }
    });
  }

  handleImgError(event: any): void {
    event.target.src = this.defaultImage;
    event.target.onerror = null; 
  }

  selectPatient(patient: Patient): void {
    if (!patient.id) return; 

    this.patientService.setCurrentPatient(patient);
    
    const nameToSave = patient.nickname || patient.firstName;
    this.gameSessionService.setPatientName(nameToSave);
    
    this.isPatientSelected = true;
    this.showModal = false;
  }

  choisirMode(isSolo: boolean) {
    this.gameSessionService.setGameMode(isSolo);
  }

  changerDeProfil(): void {
    this.patientService.setCurrentPatient(null); 
    this.isPatientSelected = false; 
  }

  @ViewChild('passwordInput') set passwordInputRef(content: ElementRef<HTMLInputElement> | undefined) {
    if (content) {
      // le setTimeout de 0ms permet d'attendre la fin de l'animation CSS 
      // pour que le navigateur accepte de donner le focus au champ
      setTimeout(() => {
        content.nativeElement.focus();
      }, 50); // 50ms pour contourner l'effet 'animate-fade'
    }
  }
}