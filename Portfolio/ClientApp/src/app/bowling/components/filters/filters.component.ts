import { Component, OnInit } from '@angular/core';
import { DateHelper } from 'src/app/shared/helpers/date-helpers';
import { BowlingService } from '../../services/bowling.service';

@Component({
  selector: 'bowling-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  leagueMatchesOnly = true;
  customFilter: StatFilter = { name: "Custom", selected: false, end: new Date() };

  timeframeFilters: StatFilter[] = [
    {name: "All Time", selected: false,}, 
    {name: "Last 6 Months", selected: true, start: DateHelper.subtractMonths(6), end: new Date()}, 
    this.customFilter
  ];

  constructor(private bowlingService: BowlingService) { }

  ngOnInit(): void {
    this.selectFilter(this.timeframeFilters.find(f => f.selected));
    this.updateLeagueMatchFilter(this.leagueMatchesOnly);
  }

  selectFilter(filter: StatFilter) {
    this.timeframeFilters.forEach(f => {
      f.selected = f.name === filter.name;
    });

    this.bowlingService.setTimeRange(filter.start, filter.end);
  }

  customFilterIsSelected(): boolean {
    return this.timeframeFilters.find(f => f.selected).name === this.customFilter.name;
  }

  updateLeagueMatchFilter(enabled) {
    this.bowlingService.setLeagueMatchFilter(enabled);
  }

  updateTimeRange() {
    this.bowlingService.setTimeRange(this.customFilter.start, this.customFilter.end);
  }
}

class StatFilter {
  name: string;
  selected: boolean;
  start?: Date;
  end?: Date;
}