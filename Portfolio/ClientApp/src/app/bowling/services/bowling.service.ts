import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../auth/user';
import { BowlingSession } from '../models/bowling-session';
import { BowlingGame } from '../models/bowling-game';
import { BowlingStat, StatCategory } from '../models/bowling-stat';

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

  getStats(userId: string, statCategory: StatCategory) {
    return this.http.get<BowlingStat[]>("Bowling/GetStats/" + statCategory + "/" + userId);
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
