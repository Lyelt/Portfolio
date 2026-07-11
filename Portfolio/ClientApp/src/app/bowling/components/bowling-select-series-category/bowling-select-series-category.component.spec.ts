import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BowlingSelectSeriesCategoryComponent } from './bowling-select-series-category.component';
import { MaterialModule } from '../../../material/material.module';
import { SeriesCategoryEnum } from '../../models/series-category';

describe('BowlingSelectSeriesCategoryComponent', () => {
  let component: BowlingSelectSeriesCategoryComponent;
  let fixture: ComponentFixture<BowlingSelectSeriesCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BowlingSelectSeriesCategoryComponent ],
      imports: [ MaterialModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BowlingSelectSeriesCategoryComponent);
    component = fixture.componentInstance;
    component.label = 'Series';
    component.initialSeriesCategory = {
      category: SeriesCategoryEnum.SessionAverage,
      display: 'Session average',
      description: 'Average score per session',
      chartType: 'line'
    };
    component.seriesCategories = [component.initialSeriesCategory];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
