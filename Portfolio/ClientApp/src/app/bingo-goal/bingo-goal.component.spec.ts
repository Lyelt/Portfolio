import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BingoGoalComponent } from './bingo-goal.component';

describe('BingoGoalComponent', () => {
  let component: BingoGoalComponent;
  let fixture: ComponentFixture<BingoGoalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BingoGoalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BingoGoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
