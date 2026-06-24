import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Patient } from '../../../../models/patient.model';
import { PatientService } from '../../../../services/patient.service'; 

@Component({
  selector: 'app-patient-search',
  templateUrl: './patient-search.component.html',
  styleUrl: './patient-search.component.scss'
})
export class PatientSearchComponent implements OnInit {
  @Output() patientChosen = new EventEmitter<Patient>(); 
  
  // l'Output pour le double-clic
  @Output() patientDoubleClicked = new EventEmitter<Patient>(); 
  
  patientDefault = 'assets/img/patient-defaut.png';

  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  searchTerm: string = ''; 
  
  constructor(private patientService: PatientService) {
    this.patientService.patients$.subscribe((patientsList) => {
      this.patients = patientsList;
    });
  }

  ngOnInit(): void {
    this.patientService.getPatients();
  }

  handleImgError(event: any) {
    event.target.src = this.patientDefault;
    event.target.onerror = null;
  }

  onSearchChange(): void {
    if (this.filteredPatients.length > 0) {
      this.selectedPatient = this.filteredPatients[0];
      this.patientChosen.emit(this.selectedPatient);
    } else {
      this.selectedPatient = null;
    }
  }

  selectFirstPatient(): void {
    if (this.filteredPatients.length > 0) {
      this.selectPatient(this.filteredPatients[0]);
    }
  }

  get filteredPatients(): Patient[] {
    if (!this.searchTerm.trim()) {
        return this.patients;
      }
    const term = this.searchTerm.toLowerCase().trim();
    
    return this.patients.filter(p => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const reverseName = `${p.lastName} ${p.firstName}`.toLowerCase();
      
      return fullName.includes(term) || reverseName.includes(term);
    });
  }

  selectPatient(p: Patient): void {
    this.selectedPatient = p;
    this.patientChosen.emit(p);
  }
  
  // Fonction appelée quand on double-clique sur un patient
  onDoubleClick(p: Patient): void {
    this.patientDoubleClicked.emit(p);
  }
}
