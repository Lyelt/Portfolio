import { Component, OnInit, Input } from '@angular/core';
import { colorSets as ngxChartsColorsets } from '@swimlane/ngx-charts/release/utils/color-sets';
import * as d3 from 'd3';
import { BowlingSeries } from '../../models/bowling-series';

@Component({
  selector: 'app-bowling-chart',
  templateUrl: './bowling-chart.component.html',
  styleUrls: ['./bowling-chart.component.scss']
})
export class BowlingChartComponent implements OnInit {
  @Input() bowlingData: BowlingSeries[];
  visible = false;
  colorScheme: any;
  schemeType: string = 'ordinal';
  selectedColorScheme: string;
  curve = d3.curveLinear;

  constructor() {
    this.setColorScheme('cool');
  }

  ngOnInit() {
    this.visible = true;
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
