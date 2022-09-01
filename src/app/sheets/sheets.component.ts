import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export interface Section {
  name: string;
  sheets: { words: Sheet[]; kana: Sheet[] };
}

export interface Sheet {
  name: string;
}

@Component({
  selector: 'app-sheets',
  templateUrl: './sheets.component.html',
  styleUrls: ['./sheets.component.scss'],
})
export class SheetsComponent implements OnInit {
  type!: 'words' | 'kana';

  languages: Section[] = [
    {
      name: 'japanese',
      sheets: {
        words: [
          { name: 'jlpt-n5-score' },
          { name: 'jlpt-n4-score' },
          { name: 'jlpt-n3-score' },
          { name: 'jlpt-n2-score' },
          { name: 'jlpt-n1-score' },
        ],
        kana: [{ name: 'hiragana' }, { name: 'katakana' }],
      },
    },
  ];
  constructor(private activatedroute: ActivatedRoute) {
    this.type = this.activatedroute.snapshot.paramMap.get(
      'type'
    ) as typeof this.type;
  }

  ngOnInit(): void {}
}
