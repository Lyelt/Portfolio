import { Component, OnInit, Input, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { colorSets as ngxChartsColorsets } from '@swimlane/ngx-charts/release/utils/color-sets';
import * as d3 from 'd3';
import { BowlingSeries, SeriesCategory } from '../../models/bowling-series';
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

  bowlingData: BowlingSeries[];

  visible = false;
  colorScheme: any;
  schemeType: string = 'ordinal';
  selectedColorScheme: string;
  curve = d3.curveMonotoneX;

  constructor(private bowlingService: BowlingService) {
    this.setColorScheme('cool');
  }

  ngOnInit() {
    this.loadSeriesData();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadSeriesData();
  }

  loadSeriesData() {
    this.bowlingService.getSeries(this.category).subscribe(data => {
      data.forEach(d => d.series.forEach(s => s.name = new Date(s.name)));
      this.bowlingData = data;
      this.visible = true;
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
