import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { Component, OnDestroy, VERSION } from '@angular/core';
import { liveQuery } from 'dexie';
import { db, SettingRecord } from '../app/db';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  title = 'Card Learner';

  subscription = new Subscription();
  settings$ = new BehaviorSubject<SettingRecord[]>([]);
  darkMode = false;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {
    this.subscription.add(
      liveQuery(() => db.settings.toArray()).subscribe((settings) => {
        this.darkMode =
          settings.find((setting) => setting.setting === 'darkMode')?.value ===
          true;
      })
    );
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
