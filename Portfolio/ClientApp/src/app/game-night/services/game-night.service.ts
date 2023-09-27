import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameNight, GameNightGame } from '../models/game-night';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameNightService {
  public selectedGameNight: GameNight;
  private visibleGameNightsSubject: ReplaySubject<GameNight[]> = new ReplaySubject();
  private gamesSubject: ReplaySubject<GameNightGame[]> = new ReplaySubject();
  
  constructor(private http: HttpClient) { 
    this.reload();
  }

  public visibleGameNights(): Observable<GameNight[]> {
    return this.visibleGameNightsSubject.asObservable();
  }

  public games(): Observable<GameNightGame[]> {
    return this.gamesSubject.asObservable();
  }

  public selectGameNight(gn: GameNight): void {
    this.selectedGameNight = gn;
  }

  public skipGameNight(gn: GameNight) {
    this.http.delete(`GameNight/SkipGameNight/${gn.id}`).subscribe(() => this.reload());
  }

  private reload(): void {
    this.http
      .get<GameNight[]>(`GameNight/GetGameNights/${new Date().getTime()}/4`)
      .subscribe(data => {
        this.visibleGameNightsSubject.next(data);
        if (!this.selectedGameNight && data.length > 0)
          this.selectGameNight(data[0]);
      });

    this.http
      .get<GameNightGame[]>(`GameNight/GetGames`)
      .subscribe(data => {
        this.gamesSubject.next(data);
      });
  }
}
