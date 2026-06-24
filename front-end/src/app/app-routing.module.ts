import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientSelectionComponent } from './caregiver/patient-selection/patient-selection.component';
import { HomepageComponent } from './homepage/homepage.component'
import { DashboardComponent } from './caregiver/dashboard/dashboard.component';
import { StatisticsComponent } from './caregiver/statistics/statistics.component';
import { ConfigComponent } from './caregiver/config/config.component';
import { ProfileComponent } from './caregiver/profile/profile.component';
import { StoreSectionComponent } from './player/start-game/step1/store-section/store-section.component';
import { KitchenSectionComponent } from './player/start-game/step2/kitchen-section/kitchen-section.component';
import { StepsComponent } from './player/start-game/step3/steps/steps.component';
import { MapComponent } from './player/start-game/step1/map/map.component';
import { SelectRecipeComponent } from './player/select-recipe/select-recipe.component';
import { TwoplayerComponent } from './twoplayer/twoplayer.component';
import { SuccessComponent } from './player/start-game/success/success.component';
import { GameRulesComponent } from './game-rules/game-rules.component';
import { GuessRecipeComponent } from './twoplayer/guess-recipe/guess-recipe.component';
import { CollectionComponent } from './collection/collection.component';


const routes: Routes = [
  { path: '', component: HomepageComponent }, // Affiche la homepage au lancement
  { path: 'choix-patient', component: PatientSelectionComponent },
  { path: 'caregiver/dashboard', component: DashboardComponent },
  { path: 'caregiver/statistics', component: StatisticsComponent },
  { path: 'caregiver/config', component: ConfigComponent },
  { path: 'caregiver/profile', component: ProfileComponent },
  { path: 'map', component: MapComponent },
  { path: 'step1', component: StoreSectionComponent },
  { path: 'step2', component: KitchenSectionComponent },
  { path: 'step3', component: StepsComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'homepage', component: HomepageComponent },
  { path: 'player/select-recipe', component: SelectRecipeComponent},
  { path: 'twoplayer', component: TwoplayerComponent },
  { path: 'game-rules', component: GameRulesComponent },
  { path: 'guess-recipe', component: GuessRecipeComponent},
  { path: 'collection', component: CollectionComponent}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
