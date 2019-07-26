import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BowlingChartComponent } from './bowling-chart.component';

describe('BowlingChartComponent', () => {
  let component: BowlingChartComponent;
  let fixture: ComponentFixture<BowlingChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BowlingChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BowlingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
