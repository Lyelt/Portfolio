import { Component, Input, OnInit } from '@angular/core';
import { DateHelper } from 'src/app/shared/helpers/date-helpers';
import { BowlingService } from '../../services/bowling.service';

@Component({
  selector: 'bowling-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  isOpen: boolean = true;
  leagueMatchesOnly = true;
  customFilter: StatFilter = { name: "Custom", selected: false, end: new Date() };

  timeframeFilters: StatFilter[] = [
    {name: "All Time", selected: true,}, 
    {name: "Last 6 Months", selected: false, start: DateHelper.subtractMonths(6), end: new Date()}, 
    this.customFilter
  ];

  constructor(private bowlingService: BowlingService) { }

  ngOnInit(): void {
    this.setDefaults();
    this.selectFilter(this.timeframeFilters.find(f => f.selected));
    this.updateLeagueMatchFilter(this.leagueMatchesOnly);
  }

  selectFilter(filter: StatFilter) {
    this.timeframeFilters.forEach(f => {
      f.selected = f.name === filter.name;
    });

    this.bowlingService.setTimeRange(filter.start, filter.end);
    localStorage.setItem('selectedFilter', JSON.stringify(filter));
  }

  customFilterIsSelected(): boolean {
    return this.timeframeFilters.find(f => f.selected).name === this.customFilter.name;
  }

  updateLeagueMatchFilter(enabled: boolean) {
    this.bowlingService.setLeagueMatchFilter(enabled);
    localStorage.setItem('leagueMatchFilter', JSON.stringify(enabled));
  }

  updateTimeRange() {
    this.bowlingService.setTimeRange(this.customFilter.start, this.customFilter.end);
    localStorage.setItem('customFilterStart', JSON.stringify(this.customFilter.start));
    localStorage.setItem('customFilterEnd', JSON.stringify(this.customFilter.end));
  }

  setDefaults() {
    if ('customFilterStart' in localStorage) {
      this.customFilter.start = JSON.parse(localStorage.getItem('customFilterStart'));
    }

    if ('customFilterEnd' in localStorage) {
      this.customFilter.end = JSON.parse(localStorage.getItem('customFilterEnd'));
    }

    if ('selectedFilter' in localStorage) {
      this.selectFilter(JSON.parse(localStorage.getItem('selectedFilter')));
    }

    if ('leagueMatchFilter' in localStorage) {
      this.leagueMatchesOnly = JSON.parse(localStorage.getItem('leagueMatchFilter'));
      this.updateLeagueMatchFilter(this.leagueMatchesOnly);
    }
  }
}

class StatFilter {
  name: string;
  selected: boolean;
  start?: Date;
  end?: Date;
}