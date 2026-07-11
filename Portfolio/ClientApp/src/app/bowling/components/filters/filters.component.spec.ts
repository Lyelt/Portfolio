import { BowlingService } from '../../services/bowling.service';
import { FiltersComponent } from './filters.component';

describe('FiltersComponent', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('initializes the complete filter state once', () => {
    const bowlingService = jasmine.createSpyObj<BowlingService>(
      'BowlingService',
      ['initializeFilters', 'setTimeRange', 'setLeagueMatchFilter']);
    const component = new FiltersComponent(bowlingService);

    component.ngOnInit();

    expect(bowlingService.initializeFilters).toHaveBeenCalledTimes(1);
    expect(bowlingService.initializeFilters).toHaveBeenCalledWith(undefined, undefined, true);
    expect(bowlingService.setTimeRange).not.toHaveBeenCalled();
    expect(bowlingService.setLeagueMatchFilter).not.toHaveBeenCalled();
  });

  it('restores stored defaults without emitting intermediate changes', () => {
    localStorage.setItem('selectedFilter', JSON.stringify({ name: 'Last 6 Months' }));
    localStorage.setItem('leagueMatchFilter', JSON.stringify(false));
    const bowlingService = jasmine.createSpyObj<BowlingService>(
      'BowlingService',
      ['initializeFilters', 'setTimeRange', 'setLeagueMatchFilter']);
    const component = new FiltersComponent(bowlingService);

    component.ngOnInit();

    const [start, end, leagueMatchesOnly] = bowlingService.initializeFilters.calls.mostRecent().args;
    expect(start instanceof Date).toBeTrue();
    expect(end instanceof Date).toBeTrue();
    expect(leagueMatchesOnly).toBeFalse();
    expect(bowlingService.initializeFilters).toHaveBeenCalledTimes(1);
    expect(bowlingService.setTimeRange).not.toHaveBeenCalled();
    expect(bowlingService.setLeagueMatchFilter).not.toHaveBeenCalled();
  });
});
