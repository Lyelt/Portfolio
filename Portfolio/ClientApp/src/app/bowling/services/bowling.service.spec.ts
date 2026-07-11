import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BowlingService } from './bowling.service';

describe('BowlingService', () => {
  let service: BowlingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BowlingService]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify({ ignoreCancelled: true });
  });

  it('waits for a bowler and initialized filters before requesting data', fakeAsync(() => {
    service = TestBed.inject(BowlingService);
    tick(51);
    http.expectNone('Bowling/GetDashboard');

    service.setBowlerId('bowler-1');
    tick(51);
    http.expectNone('Bowling/GetDashboard');

    service.initializeFilters(undefined, undefined, true);
    tick(51);

    const request = http.expectOne(req => req.url === 'Bowling/GetDashboard');
    expect(request.request.params.get('userId')).toBe('bowler-1');
    expect(request.request.params.get('leagueMatchesOnly')).toBe('true');
    expect(request.request.params.get('seriesCategory')).toBe('SessionAverage');
    expect(request.request.params.get('statCategory')).toBe('Overall');
    expect(request.request.params.has('startTime')).toBe(false);
    expect(request.request.params.has('endTime')).toBe(false);
    expect(request.request.urlWithParams).not.toContain('null');
    expect(request.request.urlWithParams).not.toContain('undefined');
    expect(request.request.urlWithParams).not.toContain('NaN');
    request.flush({ sessions: [], series: [], stats: [] });
  }));

  it('debounces a logical filter change into one dashboard request', fakeAsync(() => {
    service = TestBed.inject(BowlingService);
    service.setBowlerId('bowler-1');
    service.initializeFilters(undefined, undefined, true);
    tick(51);
    http.expectOne('Bowling/GetDashboard?userId=bowler-1&leagueMatchesOnly=true&seriesCategory=SessionAverage&statCategory=Overall')
      .flush({ sessions: [], series: [], stats: [] });

    service.setTimeRange(new Date('2025-01-01T00:00:00Z'), new Date('2025-02-01T00:00:00Z'));
    service.setTimeRange(new Date('2025-01-01T00:00:00Z'), new Date('2025-03-01T00:00:00Z'));
    tick(49);
    http.expectNone(req => req.url === 'Bowling/GetDashboard');
    tick(2);

    const requests = http.match(req => req.url === 'Bowling/GetDashboard');
    expect(requests.length).toBe(1);
    expect(requests[0].request.params.get('startTime')).toBe('1735689600000');
    expect(requests[0].request.params.get('endTime')).toBe('1740787200000');
    requests[0].flush({ sessions: [], series: [], stats: [] });
  }));

  it('cancels an obsolete request when filters change', fakeAsync(() => {
    service = TestBed.inject(BowlingService);
    service.setBowlerId('bowler-1');
    service.initializeFilters(undefined, undefined, true);
    tick(51);
    const obsoleteRequest = http.expectOne(req => req.url === 'Bowling/GetDashboard');

    service.setLeagueMatchFilter(false);
    tick(51);

    const currentRequest = http.expectOne(req =>
      req.url === 'Bowling/GetDashboard' && req.params.get('leagueMatchesOnly') === 'false');
    expect(obsoleteRequest.cancelled).toBe(true);
    currentRequest.flush({ sessions: [], series: [], stats: [] });
  }));

  it('does not request data for invalid dates', fakeAsync(() => {
    service = TestBed.inject(BowlingService);
    service.setBowlerId('bowler-1');
    service.initializeFilters(new Date('invalid'), new Date('2025-01-01T00:00:00Z'), true);
    tick(51);

    expect(http.match(req => req.url === 'Bowling/GetDashboard').length).toBe(0);
  }));
});
