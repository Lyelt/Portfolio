import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { BowlingSelectSeriesCategoryComponent } from './bowling-select-series-category.component';
import { SeriesCategoryEnum } from '../../models/series-category';

@NgModule({
  declarations: [BowlingSelectSeriesCategoryComponent],
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule]
})
class BowlingSelectSeriesCategoryTestModule {}

describe('BowlingSelectSeriesCategoryComponent', () => {
  let component: BowlingSelectSeriesCategoryComponent;
  let fixture: ComponentFixture<BowlingSelectSeriesCategoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BowlingSelectSeriesCategoryTestModule],
      providers: [provideNoopAnimations()]
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
