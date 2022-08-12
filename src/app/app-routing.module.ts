import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LearnComponent } from './learn/learn.component';
import { StudyComponent } from './study/study.component';
import { SheetsComponent } from './sheets/sheets.component';
import { CheckCardsComponent } from './check-cards/check-cards.component';

import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: 'learn',
    children: [
      {
        path: '',
        component: LearnComponent,
        data: { breadcrumb: { alias: 'LearnComponent' } },
      },
      {
        path: 'study/:language/:sheet',
        component: StudyComponent,
        data: { breadcrumb: { alias: 'StudyComponent' } },
      },
      {
        path: 'sheets',
        component: SheetsComponent,
        data: { breadcrumb: { alias: 'SheetsComponent' } },
      },
      {
        path: 'check-cards',
        component: CheckCardsComponent,
        data: { breadcrumb: { alias: 'checkCardsComponent' } },
      },
    ],
  },
  { path: 'settings-component', component: SettingsComponent },
  { path: '**', component: LearnComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
