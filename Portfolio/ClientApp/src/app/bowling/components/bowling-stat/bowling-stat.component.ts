import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BowlingStat, StatCategory } from '../../models/bowling-stat';
import { BowlingService } from '../../services/bowling.service';

@Component({
  selector: 'app-bowling-stat',
  templateUrl: './bowling-stat.component.html',
  styleUrls: ['./bowling-stat.component.scss']
})
export class BowlingStatComponent implements OnInit, OnChanges {

  @Input() userId: string;
  @Input() statCategory: StatCategory;
  @Input() startTime: Date;
  @Input() endTime: Date;

  stats: BowlingStat[];
  statsLoading: boolean = true;

  constructor(private bowlingService: BowlingService) { }

  ngOnInit() {
    this.retrieveStats();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.retrieveStats();
  }

  retrieveStats() {
    this.statsLoading = true;
    this.bowlingService.getStats(this.userId, this.statCategory, this.startTime, this.endTime).subscribe(data => {
      this.stats = data;
      this.statsLoading = false;
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });
  }
}
