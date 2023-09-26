import { Component } from '@angular/core';
import { GameNightService } from '../../services/game-night.service';

@Component({
  selector: 'app-game-night-home',
  templateUrl: './game-night-home.component.html',
  styleUrls: ['./game-night-home.component.scss']
})
export class GameNightHomeComponent {
  constructor(private gnService: GameNightService) {

  }

  public skipSelectedNight(): void {
    this.gnService.skipGameNight(this.gnService.selectedGameNight);
  }
}
