import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';

import { Component, OnDestroy, VERSION } from '@angular/core';
import { liveQuery } from 'dexie';
import { db, SettingRecord } from '../app/db';

import { SharedServiceService } from './shared-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  title = 'Card Learner';

  menuOpen$!: BehaviorSubject<boolean>;

  subscription = new Subscription();
  settings$ = new BehaviorSubject<SettingRecord[]>([]);
  darkMode = false;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    sharedService: SharedServiceService
  ) {
    this.menuOpen$ = sharedService.getMenuOpen$();
    this.isHandset$.pipe(take(1)).subscribe((result) => {
      sharedService.getMenuOpen$().next(!result); // handset has menu not open by default
    });

    this.subscription.add(
      liveQuery(() => db.settings.toArray()).subscribe((settings) => {
        this.darkMode =
          settings.find((setting) => setting.setting === 'darkMode')?.value ===
          true;
      })
    );
  }

  toggleDrawer(drawer: any): void {
    drawer.toggle();
    this.menuOpen$.next(drawer.opened);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
