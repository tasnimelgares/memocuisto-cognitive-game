import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../models/patient.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  
  patient: Patient | null = null;
  successMessage: string = '';
  isSaving: boolean = false;

 constructor(
    private patientService: PatientService,
    private router: Router
  ) {
    this.patientService.currentPatient$.subscribe(p => this.patient = p);
  }

  ngOnInit() {
    
  }

  save() {
    if (this.patient) {
      this.isSaving = true;
      this.patientService.updatePatient(this.patient);
      
      this.successMessage = "Profil bien enregistré !";

      setTimeout(() => {
        this.isSaving = false;
        this.router.navigate(['/caregiver/dashboard']);
      }, 2000);
    }
  }
}