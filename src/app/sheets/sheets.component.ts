import { Component, OnInit } from '@angular/core';

export interface Section {
  name: string;
  sheets: Sheet[];
}

export interface Sheet {
  name: string;
}
@Component({
  selector: 'app-sheets',
  templateUrl: './sheets.component.html',
  styleUrls: ['./sheets.component.scss']
})

export class SheetsComponent implements OnInit {
  languages: Section[] = [
    {
      name: 'japanese',
      sheets: [
        {name: 'jlpt-n5-score'},
        {name: 'jlpt-n4-score'},
        {name: 'jlpt-n3-score'},
      ],
    },
    {
      name: 'Other language',
      sheets: [],
    },
  ];
  constructor() {
  }

  ngOnInit(): void {
  }

}
