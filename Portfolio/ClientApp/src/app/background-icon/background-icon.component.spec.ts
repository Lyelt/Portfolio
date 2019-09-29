import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundIconComponent } from './background-icon.component';

describe('BackgroundIconComponent', () => {
  let component: BackgroundIconComponent;
  let fixture: ComponentFixture<BackgroundIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackgroundIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
