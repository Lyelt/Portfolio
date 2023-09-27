import { Component } from '@angular/core';
import { GameNightService } from '../../services/game-night.service';
import { GameNight } from '../../models/game-night';
import { first } from 'rxjs';

@Component({
  selector: 'app-game-night-home',
  templateUrl: './game-night-home.component.html',
  styleUrls: ['./game-night-home.component.scss']
})
export class GameNightHomeComponent {
  private nextGameNight: GameNight;
  constructor(public gnService: GameNightService) {
    this.gnService.visibleGameNights().pipe(first()).subscribe(data => {
      if (data)
        this.nextGameNight = data[0];
    });
  }

  public skipSelectedNight(): void {
    this.gnService.skipGameNight(this.gnService.selectedGameNight);
  }

  public isSelectedGameNightNext(): boolean {
    return this.gnService.selectedGameNight?.id === this.nextGameNight?.id;
  }
}
