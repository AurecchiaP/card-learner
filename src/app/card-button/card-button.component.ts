import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-button',
  templateUrl: './card-button.component.html',
  styleUrls: ['./card-button.component.scss'],
})
export class CardButtonComponent {
  @Input()
  routerLink!: string | string[];

  @Input()
  label!: string;

  @Input()
  disabled: string | undefined;

  constructor() {}
}
