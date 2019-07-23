import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './auth/user';
import { BowlingSession, BowlingGame } from './bowling/bowling.component';

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

  startNewSession(session: BowlingSession) {
    return this.http.post("Bowling/StartNewSession", session);
  }

  addGameToSession(game: BowlingGame) {
    return this.http.post("Bowling/AddGameToSession", game);
  }
}
