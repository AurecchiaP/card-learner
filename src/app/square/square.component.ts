import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-square',
  templateUrl: './square.component.html',
  styleUrls: ['./square.component.scss'],
})
export class SquareComponent implements OnInit {
  @Input() value?: number;
  @Input() active?: boolean;

  rgb = 'rgb(120,120,120)';

  colorMap = [
    'rgb(120,120,120)',
    'rgb(255, 0, 0)',
    'rgb(255, 63, 0)',
    'rgb(255, 128, 0)',
    'rgb(255, 192, 0)',
    'rgb(255, 255, 0)',
    'rgb(192, 255, 0)',
    'rgb(128, 255, 0)',
    'rgb(63, 255, 0)',
    'rgb(0, 255, 0)',
  ]

  constructor() {
  }

  ngOnInit(): void {
    if (this.value) {
      this.rgb = this.colorMap[this.value];
    }
  }
}
