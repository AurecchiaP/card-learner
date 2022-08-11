import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LearnComponent } from './learn/learn.component';
import { StudyComponent } from './study/study.component';
import { CheckCardsComponent } from './check-cards/check-cards.component';

import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: 'learn-component',
    children: [
      {
        path: '',
        component: LearnComponent,
        data: { breadcrumb: { alias: 'LearnComponent' } },
      },
      {
        path: 'study-component',
        component: StudyComponent,
        data: { breadcrumb: { alias: 'StudyComponent' } },
      },
      {
        path: 'check-cards-component',
        component: CheckCardsComponent,
        data: { breadcrumb: { alias: 'checkCardsComponent' } },
      },
    ],
  },
  { path: 'settings-component', component: SettingsComponent },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
