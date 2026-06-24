import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { Patient } from '../../../../models/patient.model';
import { PatientService } from '../../../../services/patient.service';

@Component({
  selector: 'app-add-patient-modal',
  templateUrl: './add-patient-modal.component.html',
  styleUrl: './add-patient-modal.component.scss'
})
export class AddPatientModalComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Output() patientAdded = new EventEmitter<void>();

  DEBUG: boolean = true;

  patientFirstName: string = '';
  patientLastName: string = '';
  patientNickname: string = '';
  patientAge: string = ''; 
  isVisuallyImpaired: boolean = false;
  isHearingImpaired: boolean = false;

  // Gestion de l'image
  imagePreview: string | null = null;

  // Gestion du feedback utilisateur
  feedbackMessage: string = '';
  isError: boolean = false;

  constructor(private patientService: PatientService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
      
      if (file.type !== 'image/png') {
        this.setFeedback("Seul le format PNG est accepté pour le moment.", true);
        event.target.value = ''; // Reset l'input
        return;
      }

      // Lecture pour l'aperçu
      const reader = new FileReader();
      reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
      if (this.DEBUG) console.log("Image convertie en Base64 avec succès !");
    };
    
    reader.readAsDataURL(file);

  }

  enregistrerPatient(): void {
    // Validation des champs obligatoires
    if (!this.patientFirstName.trim() || !this.patientLastName.trim()) {
      this.setFeedback("Le prénom et le nom sont obligatoires.", true);
      return;
    }

    // Création de l'objet Patient
    const newPatient: Patient = {
      firstName: this.patientFirstName.trim(),
      lastName: this.patientLastName.trim(),
      nickname: this.patientNickname.trim() || undefined,
      age: this.patientAge ? parseInt(this.patientAge, 10) : undefined,
      imageUrl: this.imagePreview || undefined,
      accessibility: {
        isVisuallyImpaired: this.isVisuallyImpaired,
        isHearingImpaired: this.isHearingImpaired
      }
    };

    // Appel du service pour ajouter le patient
    this.patientService.addPatient(newPatient);

    // Succès 
    this.setFeedback(`Le patient ${newPatient.firstName} a bien été enregistré !`, false);
    console.log(newPatient);
    
    // Remise à zéro avec un petit délai (comme dans ta recette) pour laisser le temps de lire le message
    setTimeout(() => {
      this.patientAdded.emit();
      this.resetForm();
    }, 2000);
  }

  private setFeedback(message: string, error: boolean): void {
    this.feedbackMessage = message;
    this.isError = error;

    if(!error) {
       // Si ce n'est pas une erreur, on n'efface pas tout de suite, le resetForm s'en chargera
       return;
    }

    // Efface le message d'erreur après 3 secondes
    setTimeout(() => {
      this.feedbackMessage = '';
    }, 3000);
  }

  private resetForm(): void {
    this.patientFirstName = '';
    this.patientLastName = '';
    this.patientNickname = '';
    this.patientAge = '';
    this.imagePreview = null;
    this.feedbackMessage = '';
    this.isVisuallyImpaired = false;
    this.isHearingImpaired = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Vide l'input file
    }
  }
}