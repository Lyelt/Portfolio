import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { BowlingAddComponent } from '../bowling-add/bowling-add.component';
import { BowlingSeries } from '../../models/bowling-series';
import { BowlingSession } from '../../models/bowling-session';
import { BowlingStat } from '../../models/bowling-stat';
import { User } from '../../../auth/user';
import { BowlingService } from '../../services/bowling.service';

@Component({
  selector: 'app-bowling',
  templateUrl: './bowling.component.html',
  styleUrls: ['./bowling.component.scss']
})
export class BowlingComponent implements OnInit {
  allSessions: BowlingSession[] = [];
  filteredSessions: BowlingSession[] = [];
  bowlingDataSeries: BowlingSeries[] = [];
  bowlers: User[] = [];
  quickStats: BowlingStat[] = [];
  currentUserId: string;

  constructor(private bowlingService: BowlingService,
    private router: Router,
    private dialog: MatDialog) {

  }

  ngOnInit() {
    this.currentUserId = localStorage.getItem("userId");
    this.loadAllData();
  }

  loadAllData() {
    this.bowlingService.getBowlers().subscribe(data => {
      this.bowlers = data;
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });

    this.bowlingService.getSessions().subscribe(data => {
      this.allSessions = data;
      this.selectUser();

      this.bowlingDataSeries = this.bowlers.map(b => new BowlingSeries(this.allSessions, b));
      console.log(this.bowlingDataSeries);
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });
  }

  selectUser() {
    this.filteredSessions = this.allSessions.map(session => ({ ...session }));

    for (let session of this.filteredSessions) {
      if (this.currentUserId) {
        session.games = session.games.filter(g => g.userId == this.currentUserId);
      }
    }

    this.sortData();
    this.retrieveStats();
  }

  retrieveStats() {
    this.bowlingService.getQuickStats(this.currentUserId).subscribe(data => {
      this.quickStats = data;
    },
      (err) => {
        console.error(err);
        alert(err.message);
      });
  }

  sortData() {
    for (let session of this.filteredSessions) {
      session.games.sort((g1, g2) => g1.gameNumber - g2.gameNumber);
      for (let game of session.games) {
        game.frames.sort((f1, f2) => f1.frameNumber - f2.frameNumber);
      }
    }
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = { sessions: this.allSessions, currentUserId: this.currentUserId };

    const dialogRef = this.dialog.open(BowlingAddComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      this.loadAllData();
    });
  }
}