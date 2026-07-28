import { Component, OnInit, Input } from '@angular/core';
import { BowlingStat } from '../../models/bowling-stat';
import { BowlingService } from '../../services/bowling.service';

@Component({
  standalone: false,
  selector: 'app-bowling-stat',
  templateUrl: './bowling-stat.component.html',
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
