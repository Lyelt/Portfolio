import { Component, OnInit } from '@angular/core';
import { GameNight } from '../../models/game-night';
import { GameNightService } from '../../services/game-night.service';

@Component({
  selector: 'app-game-night-schedule',
  templateUrl: './game-night-schedule.component.html',
  styleUrls: ['./game-night-schedule.component.scss']
})
export class GameNightScheduleComponent implements OnInit {
  public gameNights: GameNight[] = [];

  constructor(private gnService: GameNightService) {}

  ngOnInit(): void {
    this.gnService.visibleGameNights().subscribe(data => {
      this.gameNights = data;
    });
  }

  public gameNightIsSelected(gn: GameNight): boolean {
    return gn.id === this.gnService.selectedGameNight?.id;
  }

  public selectGameNight(gn: GameNight): void {
    this.gnService.selectGameNight(gn);
  }

  public loadNextGameNight(): void {
    this.gnService.loadNextGameNight();
  }
}
