import { TestBed } from '@angular/core/testing';

import { BingoService } from './bingo.service';

describe('BingoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BingoService = TestBed.get(BingoService);
    expect(service).toBeTruthy();
  });
});
