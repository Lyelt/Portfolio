import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { colorSets as ngxChartsColorsets } from '@swimlane/ngx-charts';
import * as d3 from 'd3';
import { BowlingSeries } from '../../models/bowling-series';
import { SeriesCategory } from '../../models/series-category';
import { BowlingService } from '../../services/bowling.service';

@Component({
  standalone: false,
    selector: 'app-bowling-chart',
    templateUrl: './bowling-chart.component.html',
    styleUrls: ['./bowling-chart.component.scss']
})
export class BowlingChartComponent implements OnInit, OnChanges {
    @Input() category: SeriesCategory;
    initialized = false;

    bowlingData: BowlingSeries[];
    yAxisLabel: string;

    dataLoading = true;
    colorScheme = ngxChartsColorsets.find(s => s.name === 'cool');
    curve = d3.curveMonotoneX;

    constructor(private bowlingService: BowlingService) { }

    ngOnInit() {
        this.loadSeriesData();
        this.initialized = true;
    }

    ngOnChanges() {
        if (this.initialized) {
            this.loadSeriesData();
        }
    }

    loadSeriesData() {
        this.dataLoading = true;
        this.yAxisLabel = this.category.display;
        this.bowlingService.setSeriesCategory(this.category.category);

        this.bowlingService.series().subscribe(data => {
            if (data) {
                data.forEach(d => d.series.forEach(s => s.name = new Date(s.name)));
                this.bowlingData = data;
                this.dataLoading = false;
            }
        });

    }
}
