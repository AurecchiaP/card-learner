import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-key-value-pair',
  templateUrl: './key-value-pair.component.html',
  styleUrls: ['./key-value-pair.component.scss'],
})
export class KeyValuePairComponent {
  @Input() key: string | undefined;
  @Input() value: string | number | undefined;

  constructor() {}
}
