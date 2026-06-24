import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { serverUrl, httpOptionsBase } from '../configs/server.config';

@Injectable({
  providedIn: 'root'
})
export class CaregiverService {
  // L'URL pointe vers la route 'caregiver' de ton backend
  private url = serverUrl + '/caregiver';
  private httpOptions = httpOptionsBase;

  constructor(private http: HttpClient) {}

  /**
   * Vérifie si le mot de passe entré correspond à celui en base de données
   */
  verifyPassword(password: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.url}/verify-password`, 
      { password: password }, 
      this.httpOptions
    );
  }

  /**
   * Met à jour le mot de passe du soignant dans la base de données
   */
  updatePassword(newPassword: string): Observable<any> {
    return this.http.put(
      `${this.url}/update-password`, 
      { password: newPassword }, 
      this.httpOptions
    );
  }
}