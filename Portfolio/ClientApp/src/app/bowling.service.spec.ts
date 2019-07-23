import { TestBed } from '@angular/core/testing';

import { BowlingService } from './bowling.service';

describe('BowlingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BowlingService = TestBed.get(BowlingService);
    expect(service).toBeTruthy();
  });
});
