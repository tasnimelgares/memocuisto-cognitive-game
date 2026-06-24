import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; 
import { RouteConfigLoadEnd, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';


// Shared Components
import { HomepageComponent } from './homepage/homepage.component'
import { PageTitleComponent } from './shared/page-title/page-title.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ContentCardComponent } from './shared/content-card/content-card.component';
import { ButtonComponent } from './shared/button/button.component';
import { EncouragementTextComponent } from './shared/encouragement-text/encouragement-text.component';
import { HomepageTitleComponent } from './homepage/homepage-title/homepage-title.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { VictoryModalComponent } from './shared/victory-modal/victory-modal.component';

// Caregiver Components
import { PatientSelectionComponent } from './caregiver/patient-selection/patient-selection.component'; 
import { PatientSearchComponent } from './caregiver/patient-selection/patient-search/patient-search.component'; 
import { AddPatientModalComponent } from './caregiver/patient-selection/add-patient-modal/add-patient-modal.component';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './caregiver/dashboard/dashboard.component';
import { StatisticsComponent } from './caregiver/statistics/statistics.component';
import { GaugeComponent } from './caregiver/statistics/gauge/gauge.component'; 
import { RecommendationComponent } from './caregiver/statistics/recommendation/recommendation.component'; 
import { ChartComponent } from './caregiver/statistics/chart/chart.component'; 
import { DescriptionComponent } from './caregiver/statistics/description/description.component'; 
import { DetailsComponent } from './caregiver/statistics/details/details.component'; 
import { NotesComponent } from './caregiver/statistics/notes/notes.component'; 
import { ConfigComponent } from './caregiver/config/config.component';
import { ColorPaletteComponent } from './caregiver/config/color-palette/color-palette.component';
import { GameSettingsComponent } from './caregiver/config/game-settings/game-settings.component';
import { ThemeSettingsComponent } from './caregiver/config/theme-settings/theme-settings.component';
import { RecipeSettingsComponent } from './caregiver/config/recipe-settings/recipe-settings.component';
import { VoiceSettingsComponent } from './caregiver/config/voice-settings/voice-settings.component';
import { InfoInputComponent } from './caregiver/profile/info-input/info-input.component';
import { AccessibilityParamComponent } from './caregiver/profile/accessibility-param/accessibility-param.component';
import { ProfileComponent } from './caregiver/profile/profile.component';
import { HelpSettingsComponent } from './caregiver/config/help-settings/help-settings.component';

// Player Components
import { StoreSectionComponent } from './player/start-game/step1/store-section/store-section.component';
import { CountUpTimerComponent } from './shared/timer/count-up-timer/count-up-timer.component';
import { KitchenSectionComponent } from './player/start-game/step2/kitchen-section/kitchen-section.component';
import { StepsComponent } from './player/start-game/step3/steps/steps.component';
import { InstructionComponent } from './player/instruction/instruction.component';
import { AppInventoryComponent } from './player/start-game/step1/app-inventory/app-inventory.component';
import { ItemComponent } from './player/start-game/step1/app-item-card/app-item-card.component';
import { MapComponent } from './player/start-game/step1/map/map.component';
import { ZoneComponent } from './player/start-game/step1/zone/zone.component';
import { SelectRecipeComponent } from './player/select-recipe/select-recipe.component';
import { RecipeCardComponent } from './player/select-recipe/recipe-card/recipe-card.component';
import { RecipeModalComponent } from './player/select-recipe/recipe-modal/recipe-modal.component';
import { ConfigInfoComponent } from './player/select-recipe/config-info/config-info.component';
import { IngredientCardComponent } from './player/select-recipe/ingredient-card/ingredient-card.component';
import { MemoriseIngredientsComponent } from './player/select-recipe/memorise-ingredients/memorise-ingredients.component';
import { AddIngredientComponent } from './caregiver/config/add-ingredient/add-ingredient.component';
import { TwoplayerComponent } from './twoplayer/twoplayer.component';
import { BackgroundComponent } from './homepage/background/background.component';
import { SelectIngredientComponent } from './twoplayer/select-ingredient/select-ingredient.component';
import { SuccessComponent } from './player/start-game/success/success.component';
import { SelectStepsComponent } from './twoplayer/select-steps/select-steps.component';
import { GameRulesComponent } from './game-rules/game-rules.component';
import { GuessRecipeComponent } from './twoplayer/guess-recipe/guess-recipe.component';
import { StepListComponent } from './player/start-game/step3/step-list/step-list.component';
import { AidesChipsComponent } from './caregiver/statistics/aides-chips/aides-chips.component';
import { StepStatsComponent } from './caregiver/statistics/step-stats/step-stats.component';
import { IndicatorCardComponent } from './caregiver/statistics/indicator-card/indicator-card.component';
import { GameConfigComponent } from './caregiver/statistics/game-config/game-config.component';
import { GlobalSummaryComponent } from './caregiver/statistics/global-summary/global-summary.component';
import { AidesLegendComponent } from './caregiver/statistics/aides-legend/aides-legend.component';
import { RecipeFormComponent } from './shared/recipe-form/recipe-form.component';
import { FormFieldComponent } from './collection/form-field/form-field.component';
import { InactivityPopupComponent } from './player/inactivity-popup/inactivity-popup.component';
import { CatalogueComponent } from './collection/catalogue/catalogue.component';
import { CollectionComponent } from './collection/collection.component';
import { DetailCardComponent } from './collection/detail-card/detail-card.component';
import { IngredientMiniItemComponent } from './collection/ingredient-mini-item/ingredient-mini-item.component';
import { RecipeStepItemComponent } from './collection/recipe-step-item/recipe-step-item.component';
import { ConfirmationModalComponent } from './shared/confirmation-modal/confirmation-modal.component';
import { IngredientFormComponent } from './shared/ingredient-form/ingredient-form.component';


@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    PageTitleComponent,
    SidebarComponent,
    FooterComponent,
    ConfirmationModalComponent,
    PatientSelectionComponent,
    PatientSearchComponent,
    ContentCardComponent,
    DashboardComponent,
    StatisticsComponent, 
    GaugeComponent,
    RecommendationComponent,
    ChartComponent,
    DescriptionComponent,
    DetailsComponent,
    NotesComponent,
    ConfigComponent,
    ColorPaletteComponent,
    GameSettingsComponent,
    ThemeSettingsComponent,
    RecipeSettingsComponent,
    VoiceSettingsComponent,
    ProfileComponent,
    InfoInputComponent,
    AccessibilityParamComponent,
    StoreSectionComponent,
    CountUpTimerComponent,
    KitchenSectionComponent,
    StepsComponent,
    StepListComponent,
    InstructionComponent,
    AppInventoryComponent,
    ItemComponent,
    ButtonComponent,
    MapComponent,
    ZoneComponent,
    EncouragementTextComponent,
    HelpSettingsComponent,
    SelectRecipeComponent,
    RecipeCardComponent,
    RecipeModalComponent,
    ConfigInfoComponent,
    IngredientCardComponent,
    MemoriseIngredientsComponent,
    AddIngredientComponent,
    TwoplayerComponent,
    BackgroundComponent,
    SelectIngredientComponent,
    HomepageTitleComponent,
    SuccessComponent, 
    AddPatientModalComponent,
    SelectStepsComponent,
    GameRulesComponent,
    VictoryModalComponent,
    GuessRecipeComponent,
    AidesChipsComponent,
    StepStatsComponent,
    IndicatorCardComponent,
    GameConfigComponent,
    GlobalSummaryComponent,
    AidesLegendComponent,
    FormFieldComponent,
    RecipeFormComponent,
    InactivityPopupComponent,
    CatalogueComponent,
    CollectionComponent,
    DetailCardComponent,
    IngredientMiniItemComponent,
    RecipeStepItemComponent,
    IngredientFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule, //pour la barre de recherche dans parent-selection
    CommonModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule, // fonctionalités de formulaire pour la recherche d'ingrédients
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
