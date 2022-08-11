import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { Component, VERSION } from '@angular/core';
import { liveQuery } from 'dexie';
import { db, ScoreRecord } from '../app/db';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Card Learner';
  subscription = new Subscription();
  settings$ = new BehaviorSubject<ScoreRecord[]>([]);
  darkMode = false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {
    this.subscription.add(
      liveQuery(() =>
        db.scores
          .where({
            sheet: 'settings',
          })
          .toArray()
      ).subscribe(settings => {
        this.darkMode = settings.find(settings=> settings.wordId === 1)?.score === 1;
        console.log("daie", settings)
      })

    );
  }
}

