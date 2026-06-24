import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { GameResult } from '../models/game-result.model';
import { PatientService } from './patient.service';
import { serverUrl, httpOptionsBase } from '../configs/server.config';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  //private allStats: Record<string, GameResult[]> = {};

  private statsSubject = new BehaviorSubject<GameResult[]>([]);
  public stats$ = this.statsSubject.asObservable();

  private DEBUG = false;

  constructor(private patientService: PatientService, private http: HttpClient) {
    this.patientService.currentPatient$.subscribe(patient => {
      if (patient && patient.id) {
        this.loadStatsForPatient(patient.id);
      } else {
        this.statsSubject.next([]); 
      }
    });
  }

  // charge les stats de
  private loadStatsForPatient(patientId: number): void {
    // Route imbriquée : GET /api/patients/:id/stats
    this.http.get<GameResult[]>(`${serverUrl}/patients/${patientId}/stats`).subscribe(stats => {
      this.statsSubject.next(stats);
      if (this.DEBUG) console.log(`[StatsService] Stats chargées :`, stats);
    });
  }


  sauvegarderPartie(nouvellePartie: GameResult): void {
    const currentPatient = this.patientService.currentPatient$.getValue();
    
    if (!currentPatient || !currentPatient.id) {
      console.error("[StatsService] impossible de sauvegarder : aucun patient actif.");
      return;
    }

    // On lie la partie au patient
    nouvellePartie.patientId = currentPatient.id;

    // On poste sur la route générale des stats
    this.http.post<GameResult>(`${serverUrl}/stats`, nouvellePartie, httpOptionsBase).subscribe(() => {
      this.loadStatsForPatient(currentPatient.id!); 
      if (this.DEBUG) console.log(`[StatsService] partie sauvegardée pour ${currentPatient.firstName}`);
    });
  }

  /**
   * Simule la récupération des données (Backend-ready)
   */
  getStatsByPatientId(id: number): void {
    this.loadStatsForPatient(id);
    if (this.DEBUG) console.log("[StatsService] Récupération des stats pour le patient :", id);
  }

  getDernierePartie(): GameResult | null {
    const current = this.statsSubject.getValue();
    return current.length > 0 ? current[current.length - 1] : null;
  }

  /**
   * Calcule le résumé complet pour le StatisticsComponent
   */
  getStatsResume(partie: GameResult) {
     if (this.DEBUG) console.group("📊 [CALCUL STATS] Vérification Session");
     if (this.DEBUG) console.log("Données brutes reçues :", partie);
    const resume = {
      // Score global (moyenne pondérée des 3 étapes)
      score: this.calculerScoreGlobal(partie),
      // Aisance (récupérée directement de l'étape 2)
      aisance: partie.etape2.aisance,
      // Précision (clics réussis vs clics totaux)
      precision: this.calculerPrecision(partie),
      // Fatigue (chute de performance entre E1 et E3)
      fatigue: this.calculerFatigue(partie),
      // Scores détaillés par étape (%)
      scoreE1: this.calculerPourcentage(partie.etape1.ingredientsBons, partie.etape1.ingredientsTotal),
      scoreE2: this.calculerPourcentage(partie.etape2.objetsBienRanges, partie.etape2.objetsTotal),
      scoreE3: this.calculerPourcentage(partie.etape3.etapesBienOrdonnees, partie.etape3.etapesTotal),
      // Temps total formaté
      tempsFormate: this.formaterTemps(partie.global.tempsTotal)
    };

    if (this.DEBUG) console.table({
        "Score Global (%)": resume.score + "%",
        "Aisance E2 (%)": resume.aisance + "%",
        "Précision E1 (%)": resume.precision + "%",
        "Indice Fatigue (%)": resume.fatigue + "%"
    });
    if (this.DEBUG) console.groupEnd();
    return resume;
  }

  private calculerScoreGlobal(partie: GameResult): number {
  const totalTrouve = partie.etape1.ingredientsBons + partie.etape2.objetsBienRanges + partie.etape3.etapesBienOrdonnees;

  const totalAttendu =partie.etape1.ingredientsTotal +partie.etape2.objetsTotal +partie.etape3.etapesTotal;

  const score = this.calculerPourcentage(totalTrouve, totalAttendu);

  if (this.DEBUG) {
    console.group("🧮 [Score Global]");
    console.log("Total trouvé :", totalTrouve);
    console.log("Total attendu :", totalAttendu);
    console.log("Score (%) =", score);
    console.groupEnd();
  }

  return score;
}

  private calculerPrecision(partie: GameResult): number {
  const valides = partie.etape1.clicsValides;
  const horsCible = partie.etape1.clicsHorsCible;
  const total = valides + horsCible;

  const precision = total === 0 ? 100 : this.calculerPourcentage(valides, total);

  if (this.DEBUG) {
    console.group("[Précision E1]");
    console.log("Clics valides :", valides);
    console.log("Clics hors cible :", horsCible);
    console.log("Total clics :", total);
    console.log("Précision (%) =", precision);
    console.groupEnd();
  }

  return precision;
}

    private calculerFatigue(partie: GameResult): number {
        const perfDebut = (partie.etape1.ingredientsBons || 0) / (partie.etape1.temps || 1);
        const perfFin = (partie.etape3.etapesBienOrdonnees || 0) / (partie.etape3.temps || 1);

        const fVitesse = perfDebut > 0
            ? Math.max(0, (1 - perfFin / perfDebut)) * 100
            : 0;

        const fSequence =
            ((partie.etape3.recommencements || 0) /
            (partie.etape3.etapesTotal || 1)) * 100;

        const t1 = partie.etape1.temps || 1;
        const t3 = partie.etape3.temps || 0;

        const fTemps = Math.max(0, (t3 - t1) / t1) * 100;

        const fatigue =
            0.45 * fVitesse +
            0.35 * fSequence +
            0.20 * fTemps;

        const fatigueFinale = Math.min(100, Math.max(0, Math.round(fatigue)));

        if (this.DEBUG) {
            console.group("[Fatigue]");
            console.log("Perf début (E1) :", perfDebut.toFixed(2));
            console.log("Perf fin (E3) :", perfFin.toFixed(2));
            console.log("↓ Perte vitesse (%) :", Math.round(fVitesse));

            console.log("Recommencements :", partie.etape3.recommencements);
            console.log("Impact séquence (%) :", Math.round(fSequence));

            console.log("Temps E1 :", t1, "s");
            console.log("Temps E3 :", t3, "s");
            console.log("Impact temps (%) :", Math.round(fTemps));

            console.log("➡️ Fatigue finale (%) =", fatigueFinale);
            console.groupEnd();
        }

        return fatigueFinale;
        }

  private calculerPourcentage(valeur: number, total: number): number {
    const result = (!total || total === 0)
        ? 0
        : Math.round((valeur / total) * 100);

    if (this.DEBUG) {
        console.log(` Pourcentage: ${valeur}/${total} = ${result}%`);
    }

    return result;
}

  private formaterTemps(secondesTotales: number): string {
    const minutes = Math.floor(secondesTotales / 60);
    const secondes = secondesTotales % 60;
    return `${minutes} min ${secondes} s`;
  }

  getToutesLesAides(partie: GameResult): string[] {
    return [
      ...partie.etape1.aides,
      ...partie.etape2.aides,
      ...partie.etape3.aides
    ];
  }
}