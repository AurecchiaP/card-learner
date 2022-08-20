import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
})
export class ChipComponent implements OnInit {
  @Input() value?: number;
  @Input() number?: number;
  @Input() label?: string;
  @Input() active?: boolean;

  @Output() clicked: EventEmitter<number> = new EventEmitter<number>();

  rgb = 'rgba(15,15,15, 0.6)';

  colorMap = [
    'rgba(15,15,15, 0.6)',
    'rgba(255, 0, 0, 0.6)',
    'rgb(255, 63, 0, 0.6)',
    'rgb(255, 128, 0, 0.6)',
    'rgb(255, 192, 0, 0.6)',
    'rgb(255, 255, 0, 0.6)',
    'rgb(192, 255, 0, 0.6)',
    'rgb(128, 255, 0, 0.6)',
    'rgb(63, 255, 0, 0.6)',
    'rgb(0, 255, 0, 0.6)',
  ];

  constructor() {}

  ngOnInit(): void {
    if (this.value) {
      this.rgb = this.colorMap[this.value];
    }
  }

  onChipClicked() {
    this.clicked.emit(this.number);
  }
}
