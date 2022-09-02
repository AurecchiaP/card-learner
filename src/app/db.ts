// db.ts
import Dexie, { Table } from 'dexie';

export interface ScoreRecord {
  sheet: string;
  id: number;
  value: number;
}

export interface SettingRecord {
  setting: string;
  value: boolean | number;
}

export class AppDB extends Dexie {
  scores!: Table<ScoreRecord, number>;
  settings!: Table<SettingRecord, number>;

  constructor() {
    super('ngdexieliveQuery');
    this.version(3).stores({
      scores: '[sheet+id]',
      settings: '[setting]',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    await db.scores.bulkAdd([
      {
        sheet: 'japanese/jlpt-n5-score-enhanced.txt',
        id: 0,
        value: 0,
      },
      {
        sheet: 'japanese/jlpt-n4-score-enhanced.txt',
        id: 0,
        value: 0,
      },
      {
        sheet: 'japanese/jlpt-n3-score-enhanced.txt',
        id: 0,
        value: 0,
      },
      {
        sheet: 'japanese/jlpt-n2-score-enhanced.txt',
        id: 0,
        value: 0,
      },
      {
        sheet: 'japanese/jlpt-n1-score-enhanced.txt',
        id: 0,
        value: 0,
      },
      {
        sheet: 'japanese/katakana.txt',
        id: 0,
        value: 0,
      },
      {
        sheet: 'japanese/hiragana.txt',
        id: 0,
        value: 0,
      },
    ]);
    await db.settings.bulkAdd([
      {
        setting: 'randomize',
        value: false,
      },
      {
        setting: 'order by least known',
        value: false,
      },
      {
        setting: 'skip not encountered',
        value: false,
      },
      {
        setting: 'skip learned cards',
        value: false,
      },
      {
        setting: 'darkMode',
        value: false,
      },
      {
        setting: 'show kana',
        value: false,
      },
      {
        setting: 'show romaji',
        value: false,
      },
    ]);
  }
}

export const db = new AppDB();
