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
import { db, ScoreRecord, SettingRecord } from '../db';
import { liveQuery } from 'dexie';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

interface EntryRecord {
  id: number;
  word: string;
  kana: string;
  romaji: string;
  definition: string;
  pitch: string;
  score: number;
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements AfterContentInit, OnDestroy {
  sheet: string;

  words: EntryRecord[] = [];
  wordId = 0;

  currentWord: string | undefined;
  currentKana: string | undefined;
  currentRomaji: string | undefined;
  currentPitch: string | undefined;
  currentScore: number | undefined;

  currentTranslation: string | undefined;
  flipped = false;

  showKana = false;

  showRomaji = false;

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
                    kana: splitRow[1],
                    romaji: splitRow[2],
                    definition: splitRow[3],
                    pitch: splitRow[4],
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
              this.sort(mergedWords);
              let firstWord = mergedWords[0];
              this.wordId = firstWord.id as number;
              this.currentWord = firstWord.word;
              this.currentKana = firstWord.kana;
              this.currentRomaji = firstWord.romaji;
              this.currentTranslation = firstWord.definition;
              this.currentPitch = firstWord.pitch;
              this.currentScore = firstWord.score;
            }
            return mergedWords;
          })
        )
        .subscribe(this.mergedWords$)
    );

    this.subscription.add(this.mergedWords$.subscribe(this.chipListWords$));
    this.subscription.add(
      this.settings$
        .pipe(filter((settings) => settings.length != 0))
        .subscribe((settings) => {
          this.showKana = settings.find(
            (setting) => setting.setting === 'show kana'
          )?.value as boolean;
          this.showRomaji = settings.find(
            (setting) => setting.setting === 'show romaji'
          )?.value as boolean;
        })
    );
  }

  ngAfterContentInit() {
    this.linkListToPaginator();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  linkListToPaginator() {
    this.subscription.add(
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
        })
    );
  }

  private sort(mergedWords: EntryRecord[]) {
    let settings: Map<string, number | boolean> = new Map();
    this.settings$.value.forEach((setting) => {
      settings.set(setting.setting, setting.value);
    });

    if (settings.get('order by least known')) {
      if (settings.get('skip not encountered')) {
        // order by least known and skip not encountered
        mergedWords.sort((a, b) => {
          return (
            (a.score === 0 ? 10 : a.score) - (b.score === 0 ? 10 : b.score)
          );
        });
      } else {
        // order by least known
        mergedWords.sort((a, b) => a.score - b.score);
      }
    } else if (settings.get('skip not encountered')) {
      // skip not encountered
      mergedWords.sort((a, b) => {
        return a.score === 0 || b.score === 0 ? b.score - a.score : a.id - b.id;
      });
    }
    if (settings.get('randomize')) {
      this.shuffle(mergedWords);
    }
    if (settings.get('skip learned cards')) {
      mergedWords.sort((a, b) => {
        return a.score === 9 || b.score === 9 ? a.score - b.score : a.id - b.id;
      });
    }
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
    this.nextCard();
  }

  learned() {
    this.updateScore(9);
    this.nextCard();
  }

  wrong() {
    if (!this.currentScore) {
      this.updateScore(1);
    } else if (this.currentScore > 1) {
      this.updateScore(this.currentScore - 1);
    }
    this.nextCard();
  }

  private flip() {
    this.flipped = !this.flipped;
  }

  goToCard(cardNumber: number, cardIdInSortedList: number) {
    this.flipped = false;

    this.paginator.pageIndex = Math.floor(
      cardIdInSortedList / this.paginator.pageSize
    );

    let pageSize = this.paginator.pageSize;
    const from = this.paginator.pageIndex * pageSize;
    const to = from + pageSize;
    this.chipListWords$.next(this.mergedWords$.value.slice(from, to));

    this.updateCurrentWord(cardNumber);
  }

  private updateCurrentWord(cardNumber: number) {
    this.wordId = cardNumber;

    let nextWord = this.mergedWords$.value.find(
      (word) => word.id === this.wordId
    );
    if (nextWord) {
      this.currentWord = nextWord.word;
      this.currentKana = nextWord.kana;
      this.currentRomaji = nextWord.romaji;
      this.currentPitch = nextWord.pitch;
      this.currentScore = nextWord.score;
      setTimeout(() => {
        this.currentTranslation = nextWord?.definition;
      }, 500);
    }
  }

  flipCard() {
    this.flip();
  }

  // todo some confusion between wordId and wordCounter, it's sometimes used as the index in the mergedWords array, sometimes used to store the wordId
  nextCard() {
    const wordIdInCurrentSort =
      this.mergedWords$.value.findIndex((word) => word.id === this.wordId) + 1;
    this.goToCard(
      this.mergedWords$.value[wordIdInCurrentSort].id as number,
      wordIdInCurrentSort
    );
  }

  previousCard() {
    const wordIdInCurrentSort =
      this.mergedWords$.value.findIndex((word) => word.id === this.wordId) - 1;
    this.goToCard(
      this.mergedWords$.value[wordIdInCurrentSort].id as number,
      wordIdInCurrentSort
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
