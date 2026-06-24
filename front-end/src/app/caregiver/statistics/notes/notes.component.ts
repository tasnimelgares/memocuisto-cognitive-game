import { Component, OnDestroy, OnInit } from '@angular/core';
import { Note, NoteService } from 'src/services/note.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent implements OnInit, OnDestroy {

  listeNotes: Note[] = [];
  nouvelleNote: string = '';
  private notesSub?: Subscription;

  constructor(private notesService: NoteService) {}

  ngOnInit() {
    // on s'abonne au flux de notes du patient actuel
    this.notesSub = this.notesService.notes$.subscribe(notes => {
      this.listeNotes = notes;
    });
  }

  ajouterNote() {
    if (this.nouvelleNote.trim() !== '') {
      // ajoute la nouvelle note tout en haut de la liste
      this.notesService.ajouterNote(this.nouvelleNote);
      // Vide la zone de texte
      this.nouvelleNote = ''; 
    }
  }
  onEnter(event: any) {
  if (!event.shiftKey) {
    event.preventDefault();
    this.ajouterNote();  
  }
}

  ngOnDestroy() {
    this.notesSub?.unsubscribe();
  }

}
