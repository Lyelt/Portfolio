import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bowling-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  @Input() userId: string;
  @Input() startTime: Date;
  @Input() endTime: Date;

  constructor() { }

  ngOnInit(): void {
  }

}
