import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'bowling-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  isOpen = false;
  timeframeFilters: StatFilter[] = [
    {name: "All Time", selected: false}, 
    {name: "Last 6 Months", selected: true}, 
    {name: "Custom...", selected: false}
  ];

  constructor() { }

  ngOnInit(): void {
  }

  selectFilter(filter: StatFilter) {
    this.timeframeFilters.forEach(f => {
      f.selected = f.name === filter.name;
    });
  }
}


class StatFilter {
  name: string;
  selected: boolean;
}