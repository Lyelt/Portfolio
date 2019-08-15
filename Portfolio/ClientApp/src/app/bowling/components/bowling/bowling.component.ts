import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { BowlingStartSessionComponent } from '../bowling-start-session/bowling-start-session.component';
import { BowlingSeries, SeriesCategory } from '../../models/bowling-series';
import { BowlingSession } from '../../models/bowling-session';
import { BowlingService } from '../../services/bowling.service';
import { User } from '../../../auth/user';
import { BowlingChartComponent } from '../bowling-chart/bowling-chart.component';

@Component({
  selector: 'app-bowling',
  templateUrl: './bowling.component.html',
  styleUrls: ['./bowling.component.scss']
})
export class BowlingComponent implements OnInit {
  @ViewChild('chart') chart: BowlingChartComponent;
  currentUserId: string = localStorage.getItem("userId");
  currentSeriesCategory: SeriesCategory = SeriesCategory.SessionAverage;

  allSessions: BowlingSession[] = [];
  //filteredSessions: BowlingSession[] = [];

  //bowlingDataSeries: BowlingSeries[] = [];
  //bowlers: User[] = [];

  selectedStartTime: Date;
  selectedEndTime: Date;

  constructor(private bowlingService: BowlingService,
    private router: Router,
    private dialog: MatDialog) {

  }

  ngOnInit() {
    this.loadAllData();
  }

  updateStats() {
    this.selectedStartTime = this.chart.getStartTime();
    this.selectedEndTime = this.chart.getEndTime();
  }

  loadAllData() {
    //this.bowlingService.getSessions().subscribe(data => {
    //  this.allSessions = data;
    //  this.selectUser(this.currentUserId);

    //  //this.bowlingService.getBowlers().subscribe(data => {
    //  //  this.bowlers = data;
    //  //  this.bowlingDataSeries = this.bowlers.map(b => new BowlingSeries(this.allSessions, b));
    //  //},
    //  //(err) => {
    //  //  console.error(err);
    //  //  alert(err.message);
    //  //});
    //},
    //(err) => {
    //  console.error(err);
    //  alert(err.message);
    //});
  }

  selectUser(userId: string) {
    this.currentUserId = userId;
    //this.filteredSessions = this.allSessions.map(session => ({ ...session }));

    //for (let session of this.filteredSessions) {
    //  if (this.currentUserId) {
    //    session.games = session.games.filter(g => g.userId == this.currentUserId);
    //  }
    //}

    //this.sortData();
  }

  sortData() {
    //for (let session of this.filteredSessions) {
    //  session.games.sort((g1, g2) => g1.gameNumber - g2.gameNumber);
    //  for (let game of session.games) {
    //    game.frames.sort((f1, f2) => f1.frameNumber - f2.frameNumber);
    //  }
    //}
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = { sessions: this.allSessions };

    const dialogRef = this.dialog.open(BowlingStartSessionComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => {
      this.loadAllData();
    });
  }
}
