import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { PatientService } from './patient.service';
import { serverUrl, httpOptionsBase } from '../configs/server.config'; 

export interface Note {
  id?: number;         // Ajouté pour le back
  patientId?: number;  // Ajouté pour le lien
  date: string;
  texte: string;
}

@Injectable({
  providedIn: 'root'
})

export class NoteService {

  //private allNotes: Record<string, Note[]> = {};

  // diffuse les notes du patient actuel
  private notesSubject = new BehaviorSubject<Note[]>([]);
  public notes$ = this.notesSubject.asObservable();

  constructor(private patientService: PatientService, private http: HttpClient) {
    this.patientService.currentPatient$.subscribe(patient => {
      if (patient && patient.id) {
        this.loadNotesForPatient(patient.id);
      } else {
        this.notesSubject.next([]);
      }
    });
  }

  private loadNotesForPatient(patientId: number): void {
  this.http.get<Note[]>(`${serverUrl}/patients/${patientId}/notes`).subscribe(notes => {
    this.notesSubject.next(notes);
  });
}

  ajouterNote(texte: string): void {
  const currentPatient = this.patientService.currentPatient$.getValue();
  console.log("Patient actuel au moment de la note :", currentPatient);
  if (!currentPatient || !currentPatient.id) {
    console.error("Impossible d'ajouter la note : ID patient absent !");
    return;
  }
  if (!currentPatient) return;
  const nouvelleNote = {
    patientId: currentPatient.id, // On lie la note au patient
    date: this.formatDateFriendly(new Date()),
    texte: texte
  };
  console.log("Objet envoyé au backend :", nouvelleNote);
  this.http.post(`${serverUrl}/notes`, nouvelleNote, httpOptionsBase).subscribe({
    next: () => {
      console.log("Note enregistrée avec succès !");
      this.loadNotesForPatient(currentPatient.id!);
    },
    error: (err) => {
      console.error("Erreur lors du POST de la note :", err);
    }
  });
}

  formatDateFriendly(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const now = new Date();
    
    // configuration pour le jour et le mois (ex: "10 mars")
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

    // si l'année de la date est différente de l'année actuelle, on ajoute l'année
    if (date.getFullYear() !== now.getFullYear()) {
        options.year = 'numeric';
    }

    return date.toLocaleDateString('fr-FR', options);
    }
}