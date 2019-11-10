import { Component, OnInit, Input, ViewChild, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { colorSets as ngxChartsColorsets } from '@swimlane/ngx-charts/release/utils/color-sets';
import * as d3 from 'd3';
import { BowlingSeries } from '../../models/bowling-series';
import { SeriesCategory } from '../../models/series-category';
import { LineChartComponent } from '@swimlane/ngx-charts';
import { BowlingService } from '../../services/bowling.service';

@Component({
    selector: 'app-bowling-chart',
    templateUrl: './bowling-chart.component.html',
    styleUrls: ['./bowling-chart.component.scss']
})
export class BowlingChartComponent implements OnInit, OnChanges {
    @Input() category: SeriesCategory;
    @ViewChild('chart') chart: LineChartComponent;
    @Output() dataPointClicked: EventEmitter<any> = new EventEmitter();

    initialized: boolean = false;

    bowlingData: BowlingSeries[];
    yAxisLabel: string;

    dataLoading = true;
    colorScheme: any;
    schemeType: string = 'ordinal';
    selectedColorScheme: string;
    curve = d3.curveMonotoneX;

    constructor(private bowlingService: BowlingService) {
        this.setColorScheme('cool');
    }

    ngOnInit() {
        this.loadSeriesData();
        this.initialized = true;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.initialized) {
            this.loadSeriesData();
        }
    }

    loadSeriesData() {
        this.dataLoading = true;
        this.yAxisLabel = this.category.display;

        this.bowlingService.getSeries(this.category.category).subscribe(data => {
            data.forEach(d => d.series.forEach(s => s.name = new Date(s.name)));
            this.bowlingData = data;
            this.dataLoading = false;
        },
        (err) => {
            console.error(err);
            alert(err.message);
        });
    }

    loadSeriesDataWithTimeRange() {
        this.bowlingService.getSeriesWithRange(this.category.category, this.getStartTime(), this.getEndTime()).subscribe(data => {
            data.forEach(d => d.series.forEach(s => s.name = new Date(s.name)));
            this.bowlingData = data;
        },
        (err) => {
            console.error(err);
            alert(err.message);
        });
    }

    getStartTime() {
        return this.chart.filteredDomain[0];
    }

    getEndTime() {
        return this.chart.filteredDomain[1];
    }

    select(data) {
        if (data.name == null) {
            this.bowlingData = this.bowlingData.filter(s => s.name != data);
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
