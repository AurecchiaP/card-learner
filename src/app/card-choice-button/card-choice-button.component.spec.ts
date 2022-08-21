import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardChoiceButtonComponent } from './card-choice-button.component';

describe('CardChoiceButtonComponent', () => {
  let component: CardChoiceButtonComponent;
  let fixture: ComponentFixture<CardChoiceButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardChoiceButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardChoiceButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
