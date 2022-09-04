import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  BrowserModule,
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig,
  HammerModule,
} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgModule } from '@angular/core';
import { PortalModule } from '@angular/cdk/portal';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CardChoiceButtonComponent } from './card-choice-button/card-choice-button.component';
import { CardButtonComponent } from './card-button/card-button.component';
import { CheckCardsComponent } from './check-cards/check-cards.component';
import { ChipComponent } from './chip/chip.component';
import { LearnComponent } from './learn/learn.component';
import { SettingsComponent } from './settings/settings.component';
import { SheetsComponent } from './sheets/sheets.component';
import { QuizComponent } from './quiz/quiz.component';
import { SearchComponent } from './search/search.component';
import { KeyValuePairComponent } from './key-value-pair/key-value-pair.component';
import { StudyComponent } from './study/study.component';

import * as Hammer from 'hammerjs';

export class MyHammerConfig extends HammerGestureConfig {
  override overrides = <any>{
    swipe: { direction: Hammer.DIRECTION_ALL },
  };
}

@NgModule({
  declarations: [
    AppComponent,
    CardChoiceButtonComponent,
    CardButtonComponent,
    CheckCardsComponent,
    ChipComponent,
    LearnComponent,
    SettingsComponent,
    SheetsComponent,
    QuizComponent,
    SearchComponent,
    KeyValuePairComponent,
    StudyComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HammerModule,
    HttpClientModule,
    LayoutModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatOptionModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    PortalModule,
    ReactiveFormsModule,
  ],
  providers: [{ provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig }],
  bootstrap: [AppComponent],
})
export class AppModule {}
