import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { db, ScoreRecord } from '../../app/db';
import { liveQuery } from 'dexie';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  checked: boolean | undefined;
  subscription = new Subscription();
  settings$ = new BehaviorSubject<ScoreRecord[]>([]);

  isLoaded$ = new BehaviorSubject<boolean>(false);

  settingsForm: FormGroup = new FormGroup([]);

  constructor() {
    this.subscription.add(
      liveQuery(() =>
        db.scores
          .where({
            sheet: 'settings',
          })
          .toArray()
      ).subscribe(this.settings$)
    );

    this.settings$.subscribe((settings) => {
      settings.forEach((setting) => {
        this.settingsForm.addControl(
          setting.wordId.toString(),
          new FormControl(setting.score === 1)
        );
      });
    });
  }

  ngOnInit(): void {}

  update(formControl: number) {
    console.log(this.settingsForm.get(formControl.toString())?.value);
    this.settingsForm.get(formControl.toString())?.value ? this.updateRecord(1) : this.updateRecord(0);
  }

  async updateRecord(score: number) {
    await db.scores.put({
      sheet: 'settings',
      wordId: 0,
      score: score,
    });
  }

  async clearData() {
    await db.delete().then(()=> {
      location.reload();
    })
  }
}
