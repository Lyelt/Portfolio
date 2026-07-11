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
  let dogService: jasmine.SpyObj<DogService>;

  beforeEach(async () => {
    dogService = jasmine.createSpyObj<DogService>('DogService', [
      'getDogOwners',
      'getRecentDogTimes',
      'outsideDog',
      'onNudge',
      'onNudgeAcknowledged',
      'onConnectionStatusChange',
      'start'
    ]);
    dogService.getDogOwners.and.returnValue(of([]));
    dogService.getRecentDogTimes.and.returnValue(of([{ dog: Dog.Penny, timestamp: new Date() } as DogTime]));
    dogService.outsideDog.and.returnValue(of(Dog.Nobody));
    dogService.onNudge.and.returnValue(NEVER);
    dogService.onNudgeAcknowledged.and.returnValue(NEVER);
    dogService.onConnectionStatusChange.and.returnValue(of(true));

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
