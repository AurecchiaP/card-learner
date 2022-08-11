import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { LearnComponent } from './learn/learn.component';
import { SettingsComponent } from './settings/settings.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PortalModule } from '@angular/cdk/portal';
import { LayoutModule } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { StudyComponent } from './study/study.component';
import { CheckCardsComponent } from './check-cards/check-cards.component';
import { HttpClientModule } from '@angular/common/http';
import { SquareComponent } from './square/square.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { SheetsComponent } from './sheets/sheets.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle'; 
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field'; 

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LearnComponent,
    SettingsComponent,
    StudyComponent,
    CheckCardsComponent,
    SquareComponent,
    SheetsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    PortalModule,
    LayoutModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatListModule,
    HttpClientModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
