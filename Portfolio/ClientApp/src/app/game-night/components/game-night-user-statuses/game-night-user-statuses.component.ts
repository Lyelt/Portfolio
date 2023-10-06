import { Component, OnChanges, OnInit } from '@angular/core';
import { GameNightService } from '../../services/game-night.service';
import { GameNightUserStatus, UserStatus } from '../../models/game-night';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-game-night-user-statuses',
  templateUrl: './game-night-user-statuses.component.html',
  styleUrls: ['./game-night-user-statuses.component.scss']
})
export class GameNightUserStatusesComponent implements OnInit {
  userStatus: GameNightUserStatus;

  constructor(private gnService: GameNightService, private authService: AuthService) {

  }

  ngOnInit(): void {
    this.userStatus = this.gnService.selectedGameNight.userStatuses.find(us => us.userId === this.authService.getLoggedInUserId());
  }

  getUserStatuses(): GameNightUserStatus[] {
    return this.gnService.selectedGameNight.userStatuses.filter(us => us.userId !== this.authService.getLoggedInUserId());
  }

  userStatusIsUnknown(): boolean {
    this.userStatus = this.gnService.selectedGameNight.userStatuses.find(us => us.userId === this.authService.getLoggedInUserId());
    return this.userStatus?.status === UserStatus.Unknown;
  }

  setUserStatus(status: UserStatus): void {
    this.userStatus.status = status;
    this.gnService.saveUserStatus(this.userStatus);
  }

}
