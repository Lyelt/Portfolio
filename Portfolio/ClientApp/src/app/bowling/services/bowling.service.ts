import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../auth/user';
import { BowlingSession } from '../models/bowling-session';
import { BowlingGame } from '../models/bowling-game';
import { BowlingStat, StatCategory } from '../models/bowling-stat';
import { BowlingSeries, SingleSeriesEntry } from '../models/bowling-series';
import { SeriesCategoryEnum } from '../models/series-category';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BowlingService {
    
    public selectedBowlerId?: string = null;
    private startTime?: Date = null;
    private endTime?: Date = null;
    private leagueMatchesOnly: boolean = true; 
    private selectedSeriesCategory: SeriesCategoryEnum = SeriesCategoryEnum.SessionAverage;
    private selectedStatCategory: string = StatCategory.Overall.toString();

    private filteredSeries: BehaviorSubject<BowlingSeries[]> = new BehaviorSubject(null);
    private filteredStats: BehaviorSubject<BowlingStat[]> = new BehaviorSubject(null);
    private filteredSessions: BehaviorSubject<BowlingSession[]> = new BehaviorSubject(null);
    
    constructor(private http: HttpClient) {
        this.reload();
     }

    public setTimeRange(start?: Date, end?: Date) {
        this.startTime = new Date(start);
        this.endTime = new Date(end);
        this.reload();
    }

    public setBowlerId(id: string) {
        this.selectedBowlerId = id;
        this.reload();
    }

    public setStatCategory(category: string) {
        this.selectedStatCategory = category;
        this.reload();
    }

    public setLeagueMatchFilter(enabled: boolean) {
        this.leagueMatchesOnly = enabled;
        this.reload();
    }

    private reload() {
        this.getSeries();
        this.getStats();
        this.getSessions();
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
        return this.http.get<User[]>("Bowling/GetUsers");
    }

    private getSessions() {
        this.http.get<BowlingSession[]>(`Bowling/GetSessions/${this.getFilterUrlSegment()}`).subscribe(data => {
            this.filteredSessions.next(data);
        });
    }

    private getSeries() {
        this.http.get<BowlingSeries[]>(`Bowling/GetSeries/${this.selectedSeriesCategory}/${this.getFilterUrlSegment()}`).subscribe(data => {
            this.filteredSeries.next(data);
        });
    }

    private getStats() {
        this.http.get<BowlingStat[]>(`Bowling/GetStats/${this.selectedStatCategory}/${this.getFilterUrlSegment()}`).subscribe(data => {
            this.filteredStats.next(data);
        });
    }

    private getFilterUrlSegment(): string {
        return `${this.selectedBowlerId}/${this.leagueMatchesOnly}/${this.startTime?.getTime()}/${this.endTime?.getTime()}`;
    }

    startNewSession(session: BowlingSession) {
        return this.http.post<BowlingSession>("Bowling/StartNewSession", session);
    }

    addGameToSession(game: BowlingGame) {
        return this.http.post<BowlingGame>("Bowling/AddGameToSession", game);
    }

    deleteGame(game: BowlingGame) {
        return this.http.delete(`Bowling/DeleteGame/${game.id}`);
    }
}
