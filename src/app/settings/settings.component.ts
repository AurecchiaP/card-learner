import { Component, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { db, SettingRecord } from '../../app/db';
import { liveQuery } from 'dexie';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnDestroy {
  checked: boolean | undefined;
  subscription = new Subscription();
  settings$ = new BehaviorSubject<SettingRecord[]>([]);

  isLoaded$ = new BehaviorSubject<boolean>(false);

  settingsForm: FormGroup = new FormGroup([]);

  constructor() {
    this.subscription.add(
      liveQuery(() => db.settings.toArray()).subscribe(this.settings$)
    );

    this.subscription.add(
      this.settings$.subscribe((settings) => {
        settings.forEach((setting) => {
          this.settingsForm.addControl(
            setting.setting,
            new FormControl(setting.value)
          );
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  update(formControl: string) {
    this.settingsForm.get(formControl)?.value
      ? this.updateSetting(formControl, true)
      : this.updateSetting(formControl, false);
  }

  async updateSetting(setting: string, value: number | boolean) {
    await db.settings.put({
      setting,
      value,
    });
  }

  async clearData() {
    await db.delete().then(() => {
      location.reload();
    });
  }
}
