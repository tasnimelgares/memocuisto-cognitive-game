import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Patient } from '../models/patient.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { serverUrl, httpOptionsBase } from '../configs/server.config';


@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private url = serverUrl + '/patients';
  private httpOptions = httpOptionsBase;
  public patients$: BehaviorSubject<Patient[]> = new BehaviorSubject<Patient[]>([]);

  public currentPatient$: BehaviorSubject<Patient | null> = new BehaviorSubject<Patient | null>(null);


 constructor(private http: HttpClient) {
    this.fetchPatients(); 
  }

  fetchPatients(): void {
    this.http.get<Patient[]>(this.url).subscribe((patientsFromServer) => {
      this.patients$.next(patientsFromServer);
    });
  }

 getPatients(): void {
    this.fetchPatients();
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.url}/${id}`);
    
  }

  setCurrentPatient(patient: Patient | null): void {
    this.currentPatient$.next(patient);
  }

    addPatient(patient: Patient): void {
    // Le front envoie le patient sans ID, le back s'en occupe !
    this.http.post<Patient>(this.url, patient, this.httpOptions).subscribe(() => {
      this.fetchPatients(); // On rafraîchit la liste avec le nouveau patient
    });
  }

  updatePatient(updatedPatient: Patient): void {
    this.http.put<Patient>(`${this.url}/${updatedPatient.id}`, updatedPatient, this.httpOptions).subscribe(() => {
      this.fetchPatients(); 
      this.currentPatient$.next(updatedPatient);
    });
  }

  deletePatient(patientID: number): void {
    this.http.delete<Patient>(`${this.url}/${patientID}`, this.httpOptions).subscribe(() => {
      this.fetchPatients();
    });
  }

  
}