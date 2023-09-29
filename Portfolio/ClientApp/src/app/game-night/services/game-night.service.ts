import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameNight, GameNightGame } from '../models/game-night';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameNightService {
  private startDateTime: number;
  private gameNightsToLoad: number = 4;

  public selectedGameNight: GameNight;
  private visibleGameNightsSubject: ReplaySubject<GameNight[]> = new ReplaySubject();
  private gamesSubject: ReplaySubject<GameNightGame[]> = new ReplaySubject();
  
  constructor(private http: HttpClient) { 
    this.startDateTime = new Date().getTime();
    this.loadGameNights();
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

  public toggleCancelGameNight(gn: GameNight, cancel: boolean) {
    this.http.delete(`GameNight/${cancel ? "" : "Un"}CancelGameNight/${gn.id}`).subscribe(() => this.loadGameNights());
  }

  public skipGameNight(gn: GameNight) {
    this.http.delete(`GameNight/SkipGameNight/${gn.id}`).subscribe(() => this.loadGameNights());
  }

  public saveGames(gn: GameNight) {
    return this.http.post<GameNight>("GameNight/SaveGames", gn);
  }

  public saveMeal(gn: GameNight) {
    return this.http.post<GameNight>("GameNight/SaveMeal", gn);
  }

  public loadNextGameNight(): void {
    this.gameNightsToLoad++;
    this.loadGameNights();
  }

  private loadGameNights(): void {
    this.http
      .get<GameNight[]>(`GameNight/GetGameNights/${this.startDateTime}/${this.gameNightsToLoad}`)
      .subscribe(data => {
        this.visibleGameNightsSubject.next(data);
        if (!this.selectedGameNight && data.length > 0)
          this.selectGameNight(data[0]);
        else if (this.selectedGameNight)
          this.selectedGameNight = data.find(g => g.id === this.selectedGameNight.id);
      });

    this.http
      .get<GameNightGame[]>(`GameNight/GetGames`)
      .subscribe(data => {
        this.gamesSubject.next(data);
      });
  }
}
