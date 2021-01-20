import { Component, OnInit, Input, ViewChild, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { colorSets as ngxChartsColorsets } from '@swimlane/ngx-charts';
import * as d3 from 'd3';
import { BowlingSeries, SingleSeriesEntry } from '../../models/bowling-series';
import { SeriesCategory } from '../../models/series-category';
import { LineChartComponent, BarHorizontalComponent } from '@swimlane/ngx-charts';
import { BowlingService } from '../../services/bowling.service';

@Component({
    selector: 'app-bowling-chart',
    templateUrl: './bowling-chart.component.html',
    styleUrls: ['./bowling-chart.component.scss']
})
export class BowlingChartComponent implements OnInit, OnChanges {
    @Input() category: SeriesCategory;
    @Input() initialUserId: string;
    @ViewChild('chart') chart: LineChartComponent;
    @ViewChild('barChart') barChart: BarHorizontalComponent;
    @Output() dataPointClicked: EventEmitter<any> = new EventEmitter();

    initialized = false;

    bowlingData: BowlingSeries[];
    barChartData: SingleSeriesEntry[];
    yAxisLabel: string;

    dataLoading = true;
    colorScheme: any;
    schemeType = 'ordinal';
    selectedColorScheme: string;
    curve = d3.curveMonotoneX;

    constructor(private bowlingService: BowlingService) {
        this.setColorScheme('cool');
    }

    ngOnInit() {
        this.loadSeriesData(this.initialUserId);
        this.initialized = true;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.initialized) {
            this.loadSeriesData(this.initialUserId);
        }
    }

    loadSeriesData(userId) {
        this.dataLoading = true;
        this.yAxisLabel = this.category.display;

        this.bowlingService.getSeries(this.category.category, userId).subscribe(data => {
            data.forEach(d => d.series.forEach(s => s.name = new Date(s.name)));
            this.bowlingData = data;
            this.dataLoading = false;
        });

        this.bowlingService.getSingleSeries(this.category.category, userId).subscribe(data => {
            this.barChartData = data;
            this.dataLoading = false;
        });
    }

    loadSeriesDataWithTimeRange(userId) {
        this.bowlingService.getSeriesWithRange(this.category.category, userId, this.getStartTime(), this.getEndTime()).subscribe(data => {
            data.forEach(d => d.series.forEach(s => s.name = new Date(s.name)));
            this.bowlingData = data;
        });
    }

    getStartTime() {
        return this.chart.filteredDomain[0];
    }

    getEndTime() {
        return this.chart.filteredDomain[1];
    }

    select(data) {
        if (data.name === null) {
            this.bowlingData = this.bowlingData.filter(s => s.name !== data);
            console.log("Data for user" + data + " filtered out");
        }
        else {
            this.dataPointClicked.emit(data);
            console.log("Data point clicked: ", data);
            console.log("Time: ", data.name);
        }
    }

    setColorScheme(name) {
        this.selectedColorScheme = name;
        this.colorScheme = ngxChartsColorsets.find(s => s.name === name);
    }

    onLegendLabelClick(entry) {
        console.log('Legend clicked', entry);
    }
}
