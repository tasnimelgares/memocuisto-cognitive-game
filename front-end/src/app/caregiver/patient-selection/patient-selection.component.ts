import { Component, OnInit } from '@angular/core';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service'; 
import { Router } from '@angular/router';
import { CaregiverService } from '../../../services/caregiver.service'; 

@Component({
  selector: 'app-patient-selection',
  templateUrl: './patient-selection.component.html',
  styleUrl: './patient-selection.component.scss'
})
export class PatientSelectionComponent implements OnInit {

  DEBUG:boolean = false;
  selectedPatient: Patient | null = null;
  
  // Variables pour afficher/cacher les modales
  showAddModal: boolean = false;
  showPasswordModal: boolean = false;
  newPassword: string = '';
  showDeleteModal: boolean = false;
  
  // Variable pour l'icône œil
  isPasswordVisible: boolean = false;

  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private patientService: PatientService, 
    private caregiverService: CaregiverService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    document.documentElement.style.removeProperty('--main-bg');
    document.documentElement.style.removeProperty('--title-color'); 
  }

  retourAccueil(): void {
    this.patientService.setCurrentPatient(null); 
    this.router.navigate(['/']);                
  }

  onNewPatientSaved(): void {
    this.showAddModal = false; 
  }

  onPatientSelected(p: Patient): void {
    this.selectedPatient = p;
    this.patientService.setCurrentPatient(p);
    if (this.DEBUG) console.log(this.patientService.currentPatient$);
  }

  onPatientDoubleClicked(p: Patient): void {
    this.onPatientSelected(p); 
    this.validerSelection();   
  }

  toggleAddModal(): void {
    this.showAddModal = !this.showAddModal;
  }

  validerSelection() {
    if (this.selectedPatient) {
      this.router.navigate(['/caregiver/dashboard']);
    }
  }

  // --- GESTION DU MOT DE PASSE ---

  openPasswordModal(): void {
    this.showPasswordModal = true;
    this.newPassword = ''; 
    this.successMessage = '';
    this.errorMessage = '';
    this.isPasswordVisible = false; // On cache le mdp par défaut en ouvrant
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  saveNewPassword(): void {
    this.errorMessage = ''; 

    if (this.newPassword.trim().length > 0) {
      this.caregiverService.updatePassword(this.newPassword.trim()).subscribe({
        next: () => {
          this.successMessage = 'Le mot de passe a été mis à jour avec succès !';
          
          setTimeout(() => {
            this.closePasswordModal();
          }, 1500);
        },
        error: (err) => {
          this.errorMessage = "Une erreur est survenue lors de l'enregistrement.";
          console.error("Erreur mise à jour mot de passe:", err);
        }
      });
    }
  } 

  // --- GESTION DE LA SUPPRESSION ---

  confirmerSuppression() {
    if (this.selectedPatient) {
      this.patientService.deletePatient(this.selectedPatient.id!);
      if (this.DEBUG) console.log('Patient supprimé :', this.selectedPatient);
      
      this.toggleDeleteModal();
      this.selectedPatient = null; 
    }
  }

  toggleDeleteModal(): void {
    if (this.DEBUG) console.log("click supprimer");
    this.showDeleteModal = !this.showDeleteModal;
  }
}