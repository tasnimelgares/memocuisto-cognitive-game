export interface Ingredient {
  id: string;
  name: string;
  selected: boolean;
  rayon: 'frais' | 'epicerie' | 'fruit-legume' | 'boissons' | 'surgele' | 'boucherie-poissonnerie' | 'boulangerie' | 'epices'; 
  imageUrl?: string;
  patientId?: string;
  zoneStockage: 'frais' | 'sec' | 'surgele' | 'frais-sec';
}