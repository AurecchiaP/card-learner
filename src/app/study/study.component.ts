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
  forkJoin,
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
  take,
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
  wordId = 0;

  currentWord: string | undefined;

  currentScore: number | undefined;

  currentTranslation: string | undefined;
  flipped = false;

  scores$ = new BehaviorSubject<ScoreRecord[]>([]);

  settings$ = new BehaviorSubject<SettingRecord[]>([]);

  words$ = new Observable<EntryRecord[]>();

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

    this.words$ = this.httpClient
      .get('assets/sheets/' + this.sheet, { responseType: 'blob' })
      .pipe(
        withLatestFrom(this.scores$),
        take(1),
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
              resolve(words);
            };
            fileReader.readAsText(data);
          });
        }),
        mergeMap((promise: Promise<EntryRecord[]>) => from(promise))
      );

    this.subscription.add(
      combineLatest([this.scores$, this.words$])
        .pipe(
          filter(([scores, words]) => scores?.length > 0 && words?.length > 0),
          map(([scores, words]) => {
            if (this.loaded$.value === true) {
              // ugly, we are merging the new scores with the already loaded data, should not be needed if we update mergedData ourselves
              return this.mergedWords$.value.map((word) => {
                return {
                  ...word,
                  score:
                    scores.find((score) => score.id == word.id)?.value || 0,
                } as EntryRecord;
              });
            }
            this.loaded$.next(true);
            let mergedWords = words.map((word) => {
              return {
                ...word,
                score: scores.find((score) => score.id == word.id)?.value || 0,
              } as EntryRecord;
            });
            if (this.currentWord === undefined) {
              let sortByLeastKnown = this.settings$.value.find(
                (setting) => setting.setting === 'order by least known'
              )?.value;
              if (sortByLeastKnown) {
                mergedWords.sort((a, b) => a.score - b.score);
              }
              let randomize = this.settings$.value.find(
                (setting) => setting.setting === 'randomize'
              )?.value;
              if (randomize) {
                this.shuffle(mergedWords);
              }
              let firstWord = mergedWords[0];
              this.wordId = firstWord.id as number;
              this.currentWord = firstWord.word;
              this.currentTranslation = firstWord.definition;
              this.currentScore = firstWord.score;
            }
            return mergedWords;
          })
        )
        .subscribe(this.mergedWords$)
    );

    this.mergedWords$.subscribe(this.chipListWords$);
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

  async updateScore(value: number) {
    await db.scores.put({
      sheet: this.sheet,
      id: this.wordId,
      value,
    });
  }

  correct() {
    if (!this.currentScore) {
      this.updateScore(1);
    } else if (this.currentScore < 9) {
      this.updateScore(this.currentScore + 1);
    }
    this.flip();
  }

  learned() {
    this.updateScore(9);
    this.flip();
  }

  wrong() {
    if (!this.currentScore) {
      this.updateScore(1);
    } else if (this.currentScore > 1) {
      this.updateScore(this.currentScore - 1);
    }
    this.flip();
  }

  private flip() {
    this.flipped = !this.flipped;
  }

  goToCard(cardNumber: number) {
    this.flipped = false;
    this.updateCurrentWord(cardNumber);
  }

  private updateCurrentWord(cardNumber: number) {
    this.wordId = cardNumber;

    let nextWord = this.mergedWords$.value.find(
      (word) => word.id === this.wordId
    );
    if (nextWord) {
      this.currentWord = nextWord.word;

      this.currentScore = nextWord.score;
      setTimeout(() => {
        this.currentTranslation = nextWord?.definition;
      }, 800);
    }
  }

  // todo some confusion between wordId and wordCounter, it's sometimes used as the index in the mergedWords array, sometimes used to store the wordId
  nextCard() {
    this.goToCard(
      this.mergedWords$.value[
        this.mergedWords$.value.findIndex((word) => word.id === this.wordId) + 1
      ].id as number
    );
  }

  previousCard() {
    this.goToCard(
      this.mergedWords$.value[
        this.mergedWords$.value.findIndex((word) => word.id === this.wordId) - 1
      ].id as number
    );
  }

  private shuffle(a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
