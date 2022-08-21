import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-choice-button',
  templateUrl: './card-choice-button.component.html',
  styleUrls: ['./card-choice-button.component.scss'],
})
export class CardChoiceButtonComponent {
  @Input()
  routerLink1!: string | string[];

  @Input()
  routerLink2!: string | string[];

  @Input()
  label!: string;

  @Input()
  disabled: string | undefined;

  constructor() {}
}
