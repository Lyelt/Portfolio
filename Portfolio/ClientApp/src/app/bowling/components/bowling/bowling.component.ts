import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { BowlingStartSessionComponent } from '../bowling-start-session/bowling-start-session.component';
import { BowlingChartComponent } from '../bowling-chart/bowling-chart.component';
import { SeriesCategory, SeriesCategoryEnum } from '../../models/series-category';
import { BowlingUtilities } from '../../models/bowling-utilities';
import { BowlingService } from '../../services/bowling.service';

@Component({
    selector: 'app-bowling',
    templateUrl: './bowling.component.html',
    styleUrls: ['./bowling.component.scss']
})
export class BowlingComponent implements OnInit {
    @ViewChild('chart') chart: BowlingChartComponent;
    currentUserId: string; 
    currentSeriesCategory: SeriesCategory;
    categoryLabels: SeriesCategory[] = BowlingUtilities.allSeriesCategories;

    selectedStartTime: Date;
    selectedEndTime: Date;

    view: string;

    constructor(private dialog: MatDialog, private bowlingService: BowlingService) {

    }

    ngOnInit() {
        const loggedInUser = localStorage.getItem('userId');
        this.bowlingService.getBowlers().subscribe(bowlers => {
            if (bowlers.find(b => b.id === loggedInUser)) {
                this.currentUserId = loggedInUser;
            }
        });
        this.currentSeriesCategory = this.categoryLabels.find(c => c.category == SeriesCategoryEnum.SessionAverage);
        this.view = 'overview';
    }

    refreshChart() {
        this.chart.loadSeriesData(this.currentUserId);
    }

    updateStats() {
        if (this.currentSeriesCategory.chartType == "line") {
            this.selectedStartTime = this.chart.getStartTime();
            this.selectedEndTime = this.chart.getEndTime();
            this.chart.loadSeriesDataWithTimeRange(this.currentUserId);
        }
    }

    selectUser(userId: string) {
        this.currentUserId = userId;
    }

    selectSeriesCategory(category: SeriesCategory) {
        this.currentSeriesCategory = category;
    }

    openDialog(dataPoint = null) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.data = dataPoint;

        this.dialog.open(BowlingStartSessionComponent, dialogConfig);
    }
}
