import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LearnComponent } from './learn/learn.component';
import { QuizComponent } from './quiz/quiz.component';
import { SheetsComponent } from './sheets/sheets.component';
import { CheckCardsComponent } from './check-cards/check-cards.component';

import { SettingsComponent } from './settings/settings.component';
import { StudyComponent } from './study/study.component';

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
        path: 'quiz/:language/:sheet',
        component: QuizComponent,
        data: { breadcrumb: { alias: 'QuizComponent' } },
      },
      {
        path: 'sheets/:type',
        component: SheetsComponent,
        data: { breadcrumb: { alias: 'SheetsComponent' } },
      },
      {
        path: 'study/:language/:sheet',
        component: StudyComponent,
        data: { breadcrumb: { alias: 'StudyComponent' } },
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
