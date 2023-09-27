import { Component } from '@angular/core';
import { GameNightService } from '../../services/game-night.service';
import { GameNightGame } from '../../models/game-night';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent {
  public games: GameNightGame[] = [];

  constructor(private gnService: GameNightService) {
    this.gnService.games().subscribe(data => {
      this.games = data;
    });
  }
}
