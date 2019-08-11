import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../auth/user';
import { BowlingSession } from '../models/bowling-session';
import { BowlingGame } from '../models/bowling-game';
import { BowlingStat } from '../models/bowling-stat';

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

  getQuickStats(userId: string) {
    return this.http.get<BowlingStat[]>("Bowling/GetOverallStats/" + userId);
  }

  getSplitStats(userId: string) {
    return this.http.get<BowlingStat[]>("Bowling/GetSplitStats/" + userId);
  }

  getCountStats(userId: string) {
    return this.http.get<BowlingStat[]>("Bowling/GetCountStats/" + userId);
  }

  getRecordStats(userId: string) {
    return this.http.get<BowlingStat[]>("Bowling/GetRecordStats/" + userId);
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
