import { OverlayContainer } from '@angular/cdk/overlay';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';

import { Component, OnDestroy } from '@angular/core';
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
    private overlayContainer: OverlayContainer,
    private breakpointObserver: BreakpointObserver,
    sharedService: SharedServiceService
  ) {
    this.menuOpen$ = sharedService.getMenuOpen$();
    this.isHandset$.pipe(take(1)).subscribe((result) => {
      sharedService.getMenuOpen$().next(!result); // handset has menu not open by default
    });

    this.subscription.add(
      liveQuery(() => db.settings.toArray()).subscribe(this.settings$)
    );

    this.subscription.add(
      this.settings$.subscribe((settings) => {
        this.darkMode =
          settings.find((setting) => setting.setting === 'darkMode')?.value ===
          true;
        const overlayContainerClasses =
          this.overlayContainer.getContainerElement().classList;
        overlayContainerClasses.add(
          this.darkMode ? 'dark-theme' : 'light-theme'
        );
      })
    );
  }

  ngOnInit(): void {
    const overlayContainerClasses =
      this.overlayContainer.getContainerElement().classList;
    overlayContainerClasses.add(this.darkMode ? 'dark-theme' : 'light-theme');
  }

  toggleDrawer(drawer: any): void {
    drawer.toggle();
    this.menuOpen$.next(drawer.opened);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
