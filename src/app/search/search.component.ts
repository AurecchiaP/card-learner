import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

interface Result {
  kanji: { character: string; stroke: number };
  radical: { character: string; stroke: number; order: number };
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

  constructor(private http: HttpClient) {}

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
              console.log('search result', data);
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
              console.log('search result', data);
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
