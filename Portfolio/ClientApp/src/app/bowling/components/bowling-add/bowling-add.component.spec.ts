import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BowlingAddComponent } from './bowling-add.component';

describe('BowlingAddComponent', () => {
  let component: BowlingAddComponent;
  let fixture: ComponentFixture<BowlingAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BowlingAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BowlingAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
