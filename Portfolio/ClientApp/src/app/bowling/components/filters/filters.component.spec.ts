import { BowlingService } from '../../services/bowling.service';
import { FiltersComponent } from './filters.component';

describe('FiltersComponent', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('initializes the complete filter state once', () => {
    const initializeFilters = vi.fn();
    const setTimeRange = vi.fn();
    const setLeagueMatchFilter = vi.fn();
    const bowlingService = {
      initializeFilters,
      setTimeRange,
      setLeagueMatchFilter
    } as unknown as BowlingService;
    const component = new FiltersComponent(bowlingService);

    component.ngOnInit();

    expect(initializeFilters).toHaveBeenCalledTimes(1);
    expect(initializeFilters).toHaveBeenCalledWith(undefined, undefined, true);
    expect(setTimeRange).not.toHaveBeenCalled();
    expect(setLeagueMatchFilter).not.toHaveBeenCalled();
  });

  it('restores stored defaults without emitting intermediate changes', () => {
    localStorage.setItem('selectedFilter', JSON.stringify({ name: 'Last 6 Months' }));
    localStorage.setItem('leagueMatchFilter', JSON.stringify(false));
    const initializeFilters = vi.fn();
    const setTimeRange = vi.fn();
    const setLeagueMatchFilter = vi.fn();
    const bowlingService = {
      initializeFilters,
      setTimeRange,
      setLeagueMatchFilter
    } as unknown as BowlingService;
    const component = new FiltersComponent(bowlingService);

    component.ngOnInit();

    const [start, end, leagueMatchesOnly] = initializeFilters.mock.calls.at(-1);
    expect(start instanceof Date).toBe(true);
    expect(end instanceof Date).toBe(true);
    expect(leagueMatchesOnly).toBe(false);
    expect(initializeFilters).toHaveBeenCalledTimes(1);
    expect(setTimeRange).not.toHaveBeenCalled();
    expect(setLeagueMatchFilter).not.toHaveBeenCalled();
  });
});
