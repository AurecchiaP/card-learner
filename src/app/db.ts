// db.ts
import Dexie, { Table } from 'dexie';

export interface ScoreRecord {
  sheet: string;
  wordId: number;
  score: number;
}

export class AppDB extends Dexie {
  scores!: Table<ScoreRecord, number>;

  constructor() {
    super('ngdexieliveQuery');
    this.version(3).stores({
      scores: '[sheet+wordId]',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    await db.scores.bulkAdd([
      {
        sheet: 'japanese/jlpt-n5-score.txt',
        wordId: 0,
        score: 0,
      },
      {
        sheet: 'japanese/jlpt-n4-score.txt',
        wordId: 0,
        score: 0,
      },
      {
        sheet: 'japanese/jlpt-n3-score.txt',
        wordId: 0,
        score: 0,
      },
      {
        sheet: 'settings',
        wordId: 0,
        score: 0,
      },
    ]);
  }
}

export const db = new AppDB();
