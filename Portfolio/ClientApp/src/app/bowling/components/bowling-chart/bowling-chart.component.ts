import { Component, OnInit, Input, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { colorSets as ngxChartsColorsets } from '@swimlane/ngx-charts/release/utils/color-sets';
import * as d3 from 'd3';
import { BowlingSeries, SeriesCategory } from '../../models/bowling-series';
import { LineChartComponent } from '@swimlane/ngx-charts';
import { BowlingService } from '../../services/bowling.service';
import { BowlingUtilities } from '../../models/bowling-utilities';

@Component({
  selector: 'app-bowling-chart',
  templateUrl: './bowling-chart.component.html',
  styleUrls: ['./bowling-chart.component.scss']
})
export class BowlingChartComponent implements OnInit, OnChanges {
  @Input() category: SeriesCategory;
  @ViewChild('chart') chart: LineChartComponent;
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
    this.bowlingService.getSeries(this.category).subscribe(data => {
      data.forEach(d => d.series.forEach(s => s.name = new Date(s.name)));
      this.bowlingData = data;
      this.dataLoading = false;
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });

    this.yAxisLabel = BowlingUtilities.getCategoryLabel(this.category);
  }

  getStartTime() {
    return this.chart.filteredDomain[0];
  }

  getEndTime() {
    return this.chart.filteredDomain[1];
  }

  select(data) {
    console.log('Item clicked', data);
  }

  setColorScheme(name) {
    this.selectedColorScheme = name;
    this.colorScheme = ngxChartsColorsets.find(s => s.name === name);
  }

  onLegendLabelClick(entry) {
    console.log('Legend clicked', entry);
  }
}
