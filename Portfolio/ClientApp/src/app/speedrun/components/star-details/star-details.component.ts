import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Star } from '../../models/star';
import { StarTime } from '../../models/star-time';
import { SpeedrunService } from '../../services/speedrun.service';

@Component({
  selector: 'app-star-details',
  templateUrl: './star-details.component.html',
  styleUrls: ['./star-details.component.scss']
})
export class StarDetailsComponent implements OnInit {
  @Input() star: Star;
  @Input() starTimes: StarTime[];
  @Output() closed: EventEmitter<any> = new EventEmitter();

  constructor(private sr: SpeedrunService) { }

  ngOnInit(): void {
  }

  getStarTimes(): StarTime[] {
    return this.starTimes.filter(st => st.starId === this.star.starId);
  }
}
