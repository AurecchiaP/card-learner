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
    await db.scores.add({
      sheet: 'japanese/jlpt-n5-score.txt',
      wordId: 0,
      score: 0
    });
  }
}

export const db = new AppDB();
