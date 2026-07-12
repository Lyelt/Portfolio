import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of } from 'rxjs';

import { DogComponent } from './dog.component';
import { AuthService } from '../auth/auth.service';
import { Dog, DogTime } from './models/dog';
import { DogService } from './services/dog.service';

describe('DogComponent', () => {
  let component: DogComponent;
  let fixture: ComponentFixture<DogComponent>;
  let dogService: DogService;

  beforeEach(async () => {
    dogService = {
      getDogOwners: vi.fn().mockReturnValue(of([])),
      getRecentDogTimes: vi.fn().mockReturnValue(of([{ dog: Dog.Penny, timestamp: new Date() } as DogTime])),
      outsideDog: vi.fn().mockReturnValue(of(Dog.Nobody)),
      onNudge: vi.fn().mockReturnValue(NEVER),
      onNudgeAcknowledged: vi.fn().mockReturnValue(NEVER),
      onConnectionStatusChange: vi.fn().mockReturnValue(of(true)),
      start: vi.fn(),
      stop: vi.fn()
    } as unknown as DogService;

    await TestBed.configureTestingModule({
      declarations: [ DogComponent ],
      providers: [
        { provide: DogService, useValue: dogService },
        { provide: AuthService, useValue: { getLoggedInUserId: () => null } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
