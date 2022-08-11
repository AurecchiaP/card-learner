import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckCardsComponent } from './check-cards.component';

describe('CheckCardsComponent', () => {
  let component: CheckCardsComponent;
  let fixture: ComponentFixture<CheckCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckCardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
