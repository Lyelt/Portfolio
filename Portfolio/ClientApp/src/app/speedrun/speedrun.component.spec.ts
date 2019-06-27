import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeedrunComponent } from './speedrun.component';

describe('SpeedrunComponent', () => {
  let component: SpeedrunComponent;
  let fixture: ComponentFixture<SpeedrunComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeedrunComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeedrunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
