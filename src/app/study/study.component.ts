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
              this.sort(mergedWords);
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

  public show(e: any) {
    e.target.classList.add('primary-text-important');
  }

  private shuffle(a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
