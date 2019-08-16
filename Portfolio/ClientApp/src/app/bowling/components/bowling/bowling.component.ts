import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { BowlingStartSessionComponent } from '../bowling-start-session/bowling-start-session.component';
import { SeriesCategory } from '../../models/bowling-series';
import { BowlingSession } from '../../models/bowling-session';
import { BowlingService } from '../../services/bowling.service';
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

  selectedStartTime: Date;
  selectedEndTime: Date;

  constructor(private bowlingService: BowlingService,
    private router: Router,
    private dialog: MatDialog) {

  }

  ngOnInit() {
  }

  updateStats() {
    this.selectedStartTime = this.chart.getStartTime();
    this.selectedEndTime = this.chart.getEndTime();
  }

  selectUser(userId: string) {
    this.currentUserId = userId;
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(BowlingStartSessionComponent, dialogConfig);
  }
}
