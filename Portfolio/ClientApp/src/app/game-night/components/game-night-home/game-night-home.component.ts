import { Component } from '@angular/core';
import { GameNightService } from '../../services/game-night.service';
import { GameNight } from '../../models/game-night';
import { first } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-game-night-home',
  templateUrl: './game-night-home.component.html',
  styleUrls: ['./game-night-home.component.scss']
})
export class GameNightHomeComponent {
  private nextGameNight: GameNight;
  constructor(private gnService: GameNightService, private authService: AuthService) {
    this.gnService.visibleGameNights().pipe(first()).subscribe(data => {
      if (data)
        this.nextGameNight = data[0];
    });
  }

  public skipSelected(): void {
    this.gnService.skipGameNight(this.gnService.selectedGameNight);
  }

  public toggleCancelSelected(): void {
    this.gnService.toggleCancelGameNight(this.gnService.selectedGameNight, !this.gnService.selectedGameNight.isCancelled);
  }

  public isSelectedGameNightNext(): boolean {
    return this.gnService.selectedGameNight?.id === this.nextGameNight?.id;
  }

  public getSelectedGameNight(): GameNight {
    return this.gnService.selectedGameNight;
  }

  public gameNightBelongsToLoggedInUser(): boolean {
    return this.authService.getLoggedInUserId() === this.getSelectedGameNight()?.user?.id;
  }
}
