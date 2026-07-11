import { Component, Input, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'bowling-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
