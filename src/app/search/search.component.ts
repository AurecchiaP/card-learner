import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  searchType: string = '';
  searchResults: Result[] = [];
  dataLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  emptySearch() {
    this.searchValue = '';
  }

  setSearchType() {
    this.searchType = 'rem';
  }

  hideResults() {
    this.dataLoaded$.next(false);
  }

  triggerSearch() {
    if (this.searchValue !== '') {
      this.dataLoaded$.next(false);

      let headers = new HttpHeaders({
        'x-rapidapi-host': 'kanjialive-api.p.rapidapi.com',
        'x-rapidapi-key': '90651d490bmsh62276e49cf8739ep1cdbcbjsnafc89681f109',
      });

      this.http
        .get<any>(
          'https://kanjialive-api.p.rapidapi.com/api/public/search/advanced/',
          {
            params: { rem: this.searchValue },
            headers,
          }
        )
        .subscribe((data: Result[]) => {
          this.searchResults = data;
          this.dataLoaded$.next(true);
        });
    }
  }
}
