import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameNight, GameNightGame } from '../models/game-night';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameNightService {
  private games: GameNightGame[] = [];
  public selectedGameNight: GameNight;
  //private visibleGameNights: GameNight[] = [];
  private visibleGameNightsSubject: BehaviorSubject<GameNight[]> = new BehaviorSubject(null);

  constructor(private http: HttpClient) { 
    this.reload();
  }

  public visibleGameNights(): Observable<GameNight[]> {
    return this.visibleGameNightsSubject.asObservable();
  }

  public selectGameNight(gn: GameNight): void {
    this.selectedGameNight = gn;
  }

  private reload(): void {
    this.http
      .get<GameNight[]>(`GameNight/GetGameNights/${new Date().getTime()}/4`)
      .subscribe(data => {
        this.visibleGameNightsSubject.next(data);
        if (!this.selectedGameNight)
          this.selectedGameNight = data[0];
      });
  }
}
