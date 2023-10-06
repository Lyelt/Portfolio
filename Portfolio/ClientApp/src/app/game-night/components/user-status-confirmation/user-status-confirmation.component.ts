import { Component } from '@angular/core';
import { GameNightService } from '../../services/game-night.service';

@Component({
  selector: 'app-user-status-confirmation',
  templateUrl: './user-status-confirmation.component.html',
  styleUrls: ['./user-status-confirmation.component.scss']
})
export class UserStatusConfirmationComponent {

  constructor(public gnService: GameNightService){}

  
  closeModal() {
    this.gnService.skippingNight = false;
  }

  skip() {
    this.gnService.skipGameNight(this.gnService.selectedGameNight);
    this.closeModal();
  }

  cancel() {
    this.gnService.toggleCancelGameNight(this.gnService.selectedGameNight, true);
    this.closeModal();
  }
}
