import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import * as kanjiData from './kanji.json';
import { SharedServiceService } from '../shared-service.service';

interface Result {
  kanji: {
    character: string;
    strokes: { count: number; timings: number[]; images: string[] };
    meaning: {
      english: string;
    };
    onyomi: { romaji: string; katakana: string };
    kunyomi: { romaji: string; hiragana: string };
  };
  radical: {
    character: string;
    strokes: number;
    image: string;
    position: {
      hiragana: string;
      romaji: string;
      icon: string;
    };
    name: {
      hiragana: string;
      romaji: string;
    };
    meaning: {
      english: string;
    };
    animation: string[];
  };
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  searchValue: string = '';
  searchType: 'basic' | 'advanced' | 'rem' | 'kem' | 'kun' | 'on' | 'kanji' =
    'basic';
  searchResults: Result[] = [];

  dataLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  kanjiDataValues = Object.values(kanjiData) as Result[];

  menuOpen$!: Observable<boolean>;

  constructor(
    private http: HttpClient,
    sharedServiceService: SharedServiceService
  ) {
    this.menuOpen$ = sharedServiceService.getMenuOpen$();
  }

  emptySearch() {
    this.searchValue = '';
  }

  setSearchType(type: typeof this.searchType) {
    this.searchType = type;
  }

  hideResults() {
    this.dataLoaded$.next(false);
  }

  playTTS(text: string) {
    const params = new HttpParams()
      .set('key', '9c0d947188674e38b4b67ece315b7ac5')
      .set('hl', 'ja-jp')
      .set('c', 'MP3')
      .set('f', '16khz_16bit_stereo')
      .set('src', text);

    this.http
      .request('GET', 'http://api.voicerss.org/', {
        responseType: 'blob',
        params,
      })
      .subscribe((data: Blob) => {
        let url = URL.createObjectURL(data);
        let sound = document.createElement('audio');
        sound.src = url;
        document.body.appendChild(sound);
        sound.play();
      });
  }

  triggerSearch() {
    // TODO can be improved a lot, way more stuff in JSON, also it probably makes sense to look into everything and show all findings based on result
    if (this.searchValue !== '') {
      this.searchResults = [];

      this.dataLoaded$.next(false);
      // kanji
      this.kanjiDataValues.filter((obj: Result) => {
        if (obj?.kanji?.character === this.searchValue) {
          this.searchResults.push(obj);
        } else if (
          obj?.kanji?.meaning.english
            .split(',')
            .map((meaning: string) => meaning.trim())
            .some((meaning: string) => meaning === this.searchValue)
        ) {
          this.searchResults.push(obj);
        }
        // onyomi
        else if (
          obj?.kanji?.onyomi?.romaji
            .split(',')
            .map((romaji: string) => romaji.trim())
            .some((romaji: string) => romaji === this.searchValue)
        ) {
          this.searchResults.push(obj);
        } else if (
          obj?.kanji?.onyomi?.katakana
            .split('、')
            .map((katakana: string) => katakana.trim())
            .some((katakana: string) => katakana === this.searchValue)
        ) {
          this.searchResults.push(obj);
        }
        // kunyomi
        else if (
          obj?.kanji?.kunyomi?.romaji
            .split(',')
            .map((romaji: string) => romaji.trim())
            .some((romaji: string) => romaji === this.searchValue)
        ) {
          this.searchResults.push(obj);
        } else if (
          obj?.kanji?.kunyomi?.hiragana
            .split('、')
            .map((hiragana: string) => hiragana.trim())
            .some((hiragana: string) => hiragana === this.searchValue)
        ) {
          this.searchResults.push(obj);
        }
      });
      this.dataLoaded$.next(true);
    }
  }

  // this used to call the api every search
  triggerSearchOld() {
    if (this.searchValue !== '') {
      this.dataLoaded$.next(false);
      let headers = new HttpHeaders({
        'x-rapidapi-host': 'kanjialive-api.p.rapidapi.com',
        'x-rapidapi-key': '90651d490bmsh62276e49cf8739ep1cdbcbjsnafc89681f109',
      });

      switch (this.searchType) {
        case 'basic':
          this.http
            .get<any>(
              'https://kanjialive-api.p.rapidapi.com/api/public/search/' +
                this.searchValue,
              {
                headers,
              }
            )
            .subscribe((data: any[]) => {
              this.searchResults = data;
              this.dataLoaded$.next(true);
            });
          return;
        case 'rem':
        case 'kem':
        case 'kun':
        case 'on':
        case 'kanji':
          this.http
            .get<any>(
              'https://kanjialive-api.p.rapidapi.com/api/public/search/advanced/',
              {
                params: { [this.searchType]: this.searchValue },
                headers,
              }
            )
            .subscribe((data: Result[]) => {
              this.searchResults = data;
              this.dataLoaded$.next(true);
            });
          return;
        default:
          throw new Error(`Non-existent search type`);
      }
    }
  }
}
