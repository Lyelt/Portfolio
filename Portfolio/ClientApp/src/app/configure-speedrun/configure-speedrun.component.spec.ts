import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureSpeedrunComponent } from './configure-speedrun.component';

describe('ConfigureSpeedrunComponent', () => {
  let component: ConfigureSpeedrunComponent;
  let fixture: ComponentFixture<ConfigureSpeedrunComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureSpeedrunComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureSpeedrunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
