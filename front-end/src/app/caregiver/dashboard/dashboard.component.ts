import { Component, OnInit } from '@angular/core';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent implements OnInit {
  
  patientActuel: Patient | null = null;

  constructor(private patientService: PatientService) {
    this.patientService.currentPatient$.subscribe(p => {
      this.patientActuel = p;
    });
  }

  ngOnInit(): void {
    
  }
}