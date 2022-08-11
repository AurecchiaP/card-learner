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
      name: 'Japanese',
      sheets: [
        {name: 'JLPT-N5'},
        {name: 'JLPT-N4'},
        {name: 'JLPT-N3'},
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
