import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BowlingSelectSeriesCategoryComponent } from './bowling-select-series-category.component';

describe('BowlingSelectSeriesCategoryComponent', () => {
  let component: BowlingSelectSeriesCategoryComponent;
  let fixture: ComponentFixture<BowlingSelectSeriesCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BowlingSelectSeriesCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BowlingSelectSeriesCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
