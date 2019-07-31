import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BowlingSelectUserComponent } from './bowling-select-user.component';

describe('BowlingSelectUserComponent', () => {
  let component: BowlingSelectUserComponent;
  let fixture: ComponentFixture<BowlingSelectUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BowlingSelectUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BowlingSelectUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
