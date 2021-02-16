import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BowlingStat, StatCategory } from '../../models/bowling-stat';
import { BowlingService } from '../../services/bowling.service';

@Component({
  selector: 'app-bowling-stat',
  templateUrl: './bowling-stat.component.html',
  styleUrls: ['./bowling-stat.component.scss']
})
export class BowlingStatComponent implements OnInit {
  @Input() statCategory: string;
  stats: BowlingStat[];

  constructor(private bowlingService: BowlingService) { }

  ngOnInit() {
    this.bowlingService.setStatCategory(this.statCategory);
    this.bowlingService.stats().subscribe(stats => {
      this.stats = stats;
    });
  }
}
