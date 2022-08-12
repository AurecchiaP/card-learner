import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  AfterContentInit,
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  from,
  map,
  merge,
  mergeMap,
  Observable,
  Observer,
  of,
  ReplaySubject,
  startWith,
  Subscription,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { db, ScoreRecord, SettingRecord } from '../../app/db';
import { liveQuery } from 'dexie';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

interface EntryRecord {
  id?: number;
  word: string;
  definition: string;
  score: number;
}

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.scss'],
})
export class StudyComponent implements AfterContentInit, OnDestroy {
  sheet: string;

  words: EntryRecord[] = [];
  wordCounter = 0;
  currentWord: string | undefined;
  currentScore: number | undefined;

  currentTranslation: string | undefined;
  flipped = false;

  scores$ = new BehaviorSubject<ScoreRecord[]>([]);

  settings$ = new BehaviorSubject<SettingRecord[]>([]);

  words$ = new BehaviorSubject<EntryRecord[]>([]);

  mergedWords$ = new BehaviorSubject<EntryRecord[]>([]);

  chipListWords$ = new BehaviorSubject<EntryRecord[]>([]);

  loaded$ = new BehaviorSubject<boolean>(false);

  subscription = new Subscription();

  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;

  constructor(
    private httpClient: HttpClient,
    private activatedroute: ActivatedRoute
  ) {
    this.sheet = `${this.activatedroute.snapshot.paramMap.get(
      'language'
    )}/${this.activatedroute.snapshot.paramMap.get('sheet')}.txt`;
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
      liveQuery(() => db.settings.toArray()).subscribe(this.settings$)
    );

    this.subscription.add(
      this.httpClient
        .get('assets/sheets/' + this.sheet, { responseType: 'blob' })
        .pipe(
          withLatestFrom(this.scores$),
          map(([data, scores]): any => {
            let fileReader = new FileReader();
            return new Promise((resolve, reject) => {
              fileReader.onerror = () => {
                fileReader.abort();
                reject(new DOMException('Problem parsing input file.'));
              };

              fileReader.onload = () => {
                let words: EntryRecord[] = String(fileReader.result)
                  .split('\n')
                  .map((row, id) => {
                    let splitRow = row.split(':');
                    return {
                      id,
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
    this.subscription.add(
      combineLatest([this.scores$, this.words$])
        .pipe(
          filter(([scores, words]) => scores?.length > 0 && words?.length > 0),
          map(([scores, words]) => {
            this.loaded$.next(true);
            return words.map((word, index) => {
              return {
                ...word,
                score: scores.find((score) => score.id == index)?.value || 0,
              } as EntryRecord;
            });
          })
        )
        .subscribe(this.mergedWords$)
    );

    this.mergedWords$.subscribe(this.chipListWords$);

    this.getScore(this.sheet, this.wordCounter).then((score) => {
      this.currentScore = score ? score.value : 0;
    });
  }

  ngAfterContentInit() {
    this.linkListToPaginator();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  linkListToPaginator() {
    merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => this.mergedWords$.asObservable()),
        filter((data) => data?.length > 0)
      )
      .subscribe((res) => {
        let pageSize = this.paginator.pageSize;
        const from = this.paginator.pageIndex * pageSize;
        const to = from + pageSize;
        this.chipListWords$.next(res.slice(from, to));
        this.paginator.length = res.length;
      });
  }

  async getScore(sheet: string, id: number): Promise<ScoreRecord | undefined> {
    return (await db.scores.get({
      sheet,
      id,
    })) as ScoreRecord;
  }

  async getScores(sheet: string) {
    return await db.scores
      .where({
        sheet,
      })
      .toArray();
  }

  async updateScore(value: number) {
    await db.scores.put({
      sheet: this.sheet,
      id: this.wordCounter,
      value,
    });
  }

  correct() {
    this.getScore(this.sheet, this.wordCounter).then((score) => {
      if (!score) {
        this.updateScore(1);
      } else if (score.value < 9) {
        this.updateScore(score.value + 1);
      }
      this.flip();
    });
  }

  learned() {
    this.updateScore(9);
    this.flip();
  }

  wrong() {
    this.getScore(this.sheet, this.wordCounter).then((score) => {
      score = score as ScoreRecord;
      if (!score) {
        this.updateScore(1);
      } else if (score.value > 1) {
        this.updateScore(score.value - 1);
      }
      this.flip();
    });
  }

  private flip() {
    this.flipped = !this.flipped;
  }

  goToCard(cardNumber: number, randomizeAllowed?: boolean) {
    console.log('goingtocard', cardNumber);
    this.flipped = false;
    let randomize = this.settings$.value.find(
      (setting) => setting.setting === 'randomize'
    );
    if (randomizeAllowed && randomize?.value === true) {
      this.wordCounter = Math.floor(
        Math.random() * this.mergedWords$.value.length
      );
    } else {
      this.wordCounter = cardNumber;
    }
    this.currentWord = this.words$.value[this.wordCounter].word;
    setTimeout(() => {
      this.currentTranslation = this.words$.value[this.wordCounter].definition;
    }, 800);
    this.getScore(this.sheet, this.wordCounter).then((score) => {
      this.currentScore = score ? score.value : 0;
    });
  }

  next() {
    this.goToCard(this.wordCounter + 1, true);
  }

  previous() {
    this.goToCard(this.wordCounter - 1, true);
  }
}
