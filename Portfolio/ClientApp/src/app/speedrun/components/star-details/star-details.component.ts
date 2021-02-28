import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/auth/user';
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
  @Output() closed: EventEmitter<any> = new EventEmitter();

  runners: User[];
  selectedTab: string = "time";

  constructor(private sr: SpeedrunService) { }

  ngOnInit(): void {
    this.sr.getSpeedrunners().subscribe(data => {
      this.runners = data;
    });
  }

  getStarTime(runner: User): StarTime {
    return this.sr.getStarTime(this.star.starId, runner.id);
  }

  starTimeIsFastest(starTime: StarTime): boolean {
    return this.sr.starTimeIsFastest(starTime);
  }
}
