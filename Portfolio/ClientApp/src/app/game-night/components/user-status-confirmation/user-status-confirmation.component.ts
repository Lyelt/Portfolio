import { Component, HostListener } from '@angular/core';
import { GameNightService } from '../../services/game-night.service';

@Component({
  standalone: false,
  selector: 'app-user-status-confirmation',
  templateUrl: './user-status-confirmation.component.html',
  styleUrls: ['./user-status-confirmation.component.scss']
})
export class UserStatusConfirmationComponent {

  constructor(public gnService: GameNightService){}

  @HostListener('document:keydown.escape', ['$event'])
  closeOnEscape(event: KeyboardEvent) {
    if (this.gnService.skippingNight) {
      event.preventDefault();
      this.closeModal();
    }
  }

  
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
