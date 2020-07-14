import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../auth/user';
import { BowlingSession } from '../models/bowling-session';
import { BowlingGame } from '../models/bowling-game';
import { BowlingStat, StatCategory } from '../models/bowling-stat';
import { BowlingSeries, SingleSeriesEntry } from '../models/bowling-series';
import { SeriesCategoryEnum } from '../models/series-category';

@Injectable({
    providedIn: 'root'
})
export class BowlingService {

    constructor(private http: HttpClient) { }

    getBowlers() {
        return this.http.get<User[]>("Bowling/GetUsers");
    }

    getSessions() {
        return this.http.get<BowlingSession[]>("Bowling/GetSessions");
    }

    getSingleSeries(seriesCategory: SeriesCategoryEnum, userId: string) {
        return this.http.get<SingleSeriesEntry[]>("Bowling/GetSingleSeries/" + seriesCategory + "/" + userId);
    }

    getSeries(seriesCategory: SeriesCategoryEnum, userId: string) {
        return this.http.get<BowlingSeries[]>("Bowling/GetSeries/" + seriesCategory + "/" + userId);
    }

    getSeriesWithRange(seriesCategory: SeriesCategoryEnum, userId: string, startTime: Date, endTime: Date) {
        return this.http.get<BowlingSeries[]>("Bowling/GetSeries/" + seriesCategory + "/" + userId + "/" + startTime.getTime() + "/" + endTime.getTime());
    }

    getStats(userId: string, statCategory: StatCategory, startTime: Date, endTime: Date) {
        let url = "Bowling/GetStats/" + statCategory + "/" + userId;
        if (startTime && endTime)
            url += '/' + startTime.getTime() + '/' + endTime.getTime();

        return this.http.get<BowlingStat[]>(url);
    }

    startNewSession(session: BowlingSession) {
        return this.http.post<BowlingSession>("Bowling/StartNewSession", session);
    }

    addGameToSession(game: BowlingGame) {
        return this.http.post<BowlingGame>("Bowling/AddGameToSession", game);
    }

    deleteGame(game: BowlingGame) {
        return this.http.delete('Bowling/DeleteGame/' + game.id);
    }
}
