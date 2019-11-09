import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { BowlingStartSessionComponent } from '../bowling-start-session/bowling-start-session.component';
import { BowlingChartComponent } from '../bowling-chart/bowling-chart.component';
import { SeriesCategory, SeriesCategoryEnum } from '../../models/series-category';
import { BowlingUtilities } from '../../models/bowling-utilities';

@Component({
  selector: 'app-bowling',
  templateUrl: './bowling.component.html',
  styleUrls: ['./bowling.component.scss']
})
export class BowlingComponent implements OnInit {
  @ViewChild('chart') chart: BowlingChartComponent;
  currentUserId: string = localStorage.getItem("userId");
  currentSeriesCategory: SeriesCategory;
  categoryLabels: SeriesCategory[] = BowlingUtilities.lineSeriesCategories;

  selectedStartTime: Date;
  selectedEndTime: Date;

  constructor(private dialog: MatDialog) {

  }

  ngOnInit() {
    this.currentSeriesCategory = this.categoryLabels.find(c => c.category == SeriesCategoryEnum.SessionAverage);
  }

  refreshChart() {
    this.chart.loadSeriesData();
  }

  updateStats() {
    this.selectedStartTime = this.chart.getStartTime();
    this.selectedEndTime = this.chart.getEndTime();
  }

  selectUser(userId: string) {
    this.currentUserId = userId;
  }

  selectSeriesCategory(category: SeriesCategory) {
    this.currentSeriesCategory = category;
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;

    this.dialog.open(BowlingStartSessionComponent, dialogConfig);
  }
}
