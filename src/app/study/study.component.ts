import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  from,
  map,
  mergeMap,
  Observable,
  Observer,
  ReplaySubject,
  Subscription,
  withLatestFrom,
} from 'rxjs';
import { db, ScoreRecord } from '../../app/db';
import { liveQuery } from 'dexie';

interface EntryRecord {
  word: string;
  definition: string;
  score: number;
}

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.scss'],
})
export class StudyComponent {
  words: EntryRecord[] = [];
  wordCounter = 0;
  currentWord: string | undefined;
  currentScore: number | undefined;

  currentTranslation: string | undefined;
  flipped = false;

  sheet = 'japanese/jlpt-n5-score.txt';

  scores$ = new BehaviorSubject<ScoreRecord[]>([]);

  words$ = new BehaviorSubject<EntryRecord[]>([]);

  mergedWords$ = new BehaviorSubject<EntryRecord[]>([]);

  loaded$ = new BehaviorSubject<boolean>(false);

  subscription = new Subscription();

  constructor(private httpClient: HttpClient) {
    this.subscription.add(
      liveQuery(() =>
        db.scores
          .where({
            sheet: this.sheet,
          })
          .toArray()
      ).subscribe(this.scores$)
    );
    this.subscription.add(
      this.httpClient
        .get('assets/sheets/' + this.sheet, { responseType: 'blob' })
        .pipe(
          withLatestFrom(this.scores$),
          map(([data, scores]): any => {
            console.log('he', scores);
            let fileReader = new FileReader();
            return new Promise((resolve, reject) => {
              fileReader.onerror = () => {
                fileReader.abort();
                reject(new DOMException('Problem parsing input file.'));
              };

              fileReader.onload = () => {
                let words: EntryRecord[] = String(fileReader.result)
                  .split('\n')
                  .map((row) => {
                    let splitRow = row.split(':');
                    return {
                      word: splitRow[0],
                      definition: splitRow[1],
                      score: 0,
                    };
                  });
                this.currentWord = words[this.wordCounter].word;
                this.currentTranslation = words[this.wordCounter].definition;
                resolve(words);
              };
              fileReader.readAsText(data);
            });
          }),
          mergeMap((promise: Promise<EntryRecord[]>) => from(promise))
        )
        .subscribe(this.words$)
    );

    combineLatest([this.scores$, this.words$])
      .pipe(
        filter(([scores, words]) => scores?.length > 0 && words?.length > 0),
        map(([scores, words]) => {
          this.loaded$.next(true);
          return words.map((word, index) => {
            return {
              ...word,
              score: scores.find((score) => score.wordId == index)?.score || 0,
            } as EntryRecord;
          });
        })
        // .subscribe(([scores, words]) => {
        //   words.map((word, index) => {return {...word, score: scores.find(score => score.wordId == index) || 0}})
        //   console.log("data", scores, words)
        //   this.loaded$.next(true);
        // }
      )
      .subscribe(this.mergedWords$);

    this.getScore(this.sheet, this.wordCounter).then((score) => {
      this.currentScore = score ? score.score : 0;
    });
  }

  async getScore(sheet: string, wordId: number) {
    return await db.scores.get({
      sheet,
      wordId,
    });
  }

  async getScores(sheet: string) {
    return await db.scores
      .where({
        sheet,
      })
      .toArray();
  }

  async updateRecord(score: number) {
    await db.scores.put({
      sheet: this.sheet,
      wordId: this.wordCounter,
      score: score,
    });
  }

  correct() {
    this.getScore(this.sheet, this.wordCounter).then((score) => {
      if (!score) {
        this.updateRecord(2);
      } else if (score.score < 9) {
        this.updateRecord(score.score + 1);
      }
      this.flip();
    });
  }

  learned() {
    this.updateRecord(9);
    this.flip();
  }

  wrong() {
    this.getScore(this.sheet, this.wordCounter).then((score) => {
      if (!score) {
        this.updateRecord(1);
      } else if (score.score > 1) {
        this.updateRecord(score.score - 1);
      }
      this.flip();
    });
  }

  private flip() {
    this.flipped = !this.flipped;
  }

  next() {
    this.flipped = false;
    this.wordCounter += 1;
    this.currentWord = this.words$.value[this.wordCounter].word;
    setTimeout(() => {
      this.currentTranslation = this.words$.value[this.wordCounter].definition;
    }, 800);
    this.getScore(this.sheet, this.wordCounter).then((score) => {
      this.currentScore = score ? score.score : 0;
    });
  }
}
