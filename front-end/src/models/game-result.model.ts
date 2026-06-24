import { GameConfig } from "./game-config.model";

export interface GameResult {
    id?: number;       
    patientId?: number; 
     
    date: string;
    isSoloMode: boolean;
    config: GameConfig;
    global: {
        tempsTotal: number; 
    };
    etape1: {
        temps: number;
        ingredientsBons: number;
        ingredientsTotal: number;
        aides: string[]; 
        clicsValides: number;
        clicsHorsCible: number;
    };
    etape2: {
        temps: number;
        objetsBienRanges: number;
        objetsTotal: number;
        aisance: number; // Moyenne calculée (%)
        aisanceMin: number;
        aisanceMax: number;
        detailsAisanceParObjet: {
            objetId: string;
            distanceReelle: number;
            distanceOptimale: number;
            ratio: number;
        }[];
        aides: string[];
    };
    etape3: {
        temps: number;
        etapesBienOrdonnees: number;
        etapesTotal: number;
        recommencements: number;
        aides: string[];
    };
}