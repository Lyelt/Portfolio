import { Component, OnInit } from '@angular/core';
import { SpeedrunService } from '../speedrun.service';

@Component({
  selector: 'app-speedrun',
  templateUrl: './speedrun.component.html',
  styleUrls: ['./speedrun.component.scss']
})
export class SpeedrunComponent implements OnInit {
  starTimes: StarTime[] = [];

  constructor(private srService: SpeedrunService) { }

  ngOnInit() {

    this.srService.getStarTimes().subscribe(data => {
      this.starTimes = data;
    },
    (err) => console.error(err));
  }
}

export class StarTime {
  id: number;

  time: string;

  videoUrl: string;

  starId: number;

  userId: string;
}
