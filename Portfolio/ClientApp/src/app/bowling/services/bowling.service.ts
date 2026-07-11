import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../../auth/user';
import { BowlingSession } from '../models/bowling-session';
import { BowlingGame } from '../models/bowling-game';
import { BowlingStat, StatCategory } from '../models/bowling-stat';
import { BowlingSeries } from '../models/bowling-series';
import { SeriesCategoryEnum } from '../models/series-category';
import { BowlingDashboard } from '../models/bowling-dashboard';
import { BehaviorSubject, EMPTY, Observable, ReplaySubject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface BowlingFilterState {
  initialized: boolean;
  userId?: string;
  startTime?: number;
  endTime?: number;
  leagueMatchesOnly: boolean;
  seriesCategory: SeriesCategoryEnum;
  statCategory: string;
}

@Injectable({
  providedIn: 'root'
})
export class BowlingService {
  private readonly filterChanges = new BehaviorSubject<BowlingFilterState>({
    initialized: false,
    leagueMatchesOnly: true,
    seriesCategory: SeriesCategoryEnum.SessionAverage,
    statCategory: StatCategory[StatCategory.Overall]
  });

  private readonly filteredSeries = new ReplaySubject<BowlingSeries[]>(1);
  private readonly filteredStats = new ReplaySubject<BowlingStat[]>(1);
  private readonly filteredSessions = new ReplaySubject<BowlingSession[]>(1);

  constructor(private http: HttpClient) {
    this.filterChanges.pipe(
      debounceTime(50),
      distinctUntilChanged((left, right) => this.filtersEqual(left, right)),
      switchMap(filters => this.filtersAreValid(filters)
        ? this.getDashboard(filters).pipe(catchError(() => EMPTY))
        : EMPTY)
    ).subscribe(dashboard => {
      this.filteredSeries.next(dashboard.series);
      this.filteredStats.next(dashboard.stats);
      this.filteredSessions.next(dashboard.sessions);
    });
  }

  public get selectedBowlerId(): string {
    return this.filterChanges.value.userId;
  }

  public initializeFilters(start?: Date, end?: Date, leagueMatchesOnly: boolean = true) {
    this.updateFilters({
      initialized: true,
      startTime: this.toTimestamp(start),
      endTime: this.toTimestamp(end),
      leagueMatchesOnly
    });
  }

  public setTimeRange(start?: Date, end?: Date) {
    this.updateFilters({
      startTime: this.toTimestamp(start),
      endTime: this.toTimestamp(end)
    });
  }

  public setBowlerId(id: string) {
    this.updateFilters({ userId: id?.trim() || undefined });
  }

  public setSeriesCategory(category: SeriesCategoryEnum) {
    this.updateFilters({ seriesCategory: category });
  }

  public setStatCategory(category: string) {
    this.updateFilters({ statCategory: category });
  }

  public setLeagueMatchFilter(enabled: boolean) {
    this.updateFilters({ leagueMatchesOnly: enabled });
  }

  public series(): Observable<BowlingSeries[]> {
    return this.filteredSeries.asObservable();
  }

  public stats(): Observable<BowlingStat[]> {
    return this.filteredStats.asObservable();
  }

  public sessions(): Observable<BowlingSession[]> {
    return this.filteredSessions.asObservable();
  }

  public getBowlers(): Observable<User[]> {
    return this.http.get<User[]>('Bowling/GetUsers');
  }

  public startNewSession(session: BowlingSession) {
    return this.http.post<BowlingSession>('Bowling/StartNewSession', session);
  }

  public addGameToSession(game: BowlingGame) {
    return this.http.post<BowlingGame>('Bowling/AddGameToSession', game);
  }

  public deleteGame(game: BowlingGame) {
    return this.http.delete(`Bowling/DeleteGame/${game.id}`);
  }

  private getDashboard(filters: BowlingFilterState): Observable<BowlingDashboard> {
    let params = new HttpParams()
      .set('userId', filters.userId)
      .set('leagueMatchesOnly', filters.leagueMatchesOnly.toString())
      .set('seriesCategory', SeriesCategoryEnum[filters.seriesCategory])
      .set('statCategory', filters.statCategory);

    if (filters.startTime !== undefined)
      params = params.set('startTime', filters.startTime.toString());

    if (filters.endTime !== undefined)
      params = params.set('endTime', filters.endTime.toString());

    return this.http.get<BowlingDashboard>('Bowling/GetDashboard', { params });
  }

  private updateFilters(changes: Partial<BowlingFilterState>) {
    this.filterChanges.next({ ...this.filterChanges.value, ...changes });
  }

  private filtersAreValid(filters: BowlingFilterState): boolean {
    return filters.initialized &&
      !!filters.userId &&
      this.timestampIsValid(filters.startTime) &&
      this.timestampIsValid(filters.endTime) &&
      (filters.startTime === undefined || filters.endTime === undefined || filters.startTime <= filters.endTime) &&
      Number.isInteger(filters.seriesCategory) &&
      !!SeriesCategoryEnum[filters.seriesCategory] &&
      !!filters.statCategory;
  }

  private filtersEqual(left: BowlingFilterState, right: BowlingFilterState): boolean {
    return left.initialized === right.initialized &&
      left.userId === right.userId &&
      left.startTime === right.startTime &&
      left.endTime === right.endTime &&
      left.leagueMatchesOnly === right.leagueMatchesOnly &&
      left.seriesCategory === right.seriesCategory &&
      left.statCategory === right.statCategory;
  }

  private timestampIsValid(value?: number): boolean {
    return value === undefined || Number.isFinite(value);
  }

  private toTimestamp(value?: Date): number | undefined {
    if (value === undefined || value === null)
      return undefined;

    return value instanceof Date ? value.getTime() : new Date(value).getTime();
  }
}
