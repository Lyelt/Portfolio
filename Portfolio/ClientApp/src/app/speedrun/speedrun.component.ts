import { Component, OnInit } from '@angular/core';
import { SpeedrunService } from '../speedrun.service';

@Component({
  selector: 'app-speedrun',
  templateUrl: './speedrun.component.html',
  styleUrls: ['./speedrun.component.scss']
})
export class SpeedrunComponent implements OnInit {
  starTimes: StarTime[] = [];
  courses: Course[] = [];

  constructor(private srService: SpeedrunService) { }

  ngOnInit() {

    this.srService.getCourses().subscribe(data => {
      this.courses = data;
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });

    this.srService.getStarTimes().subscribe(data => {
      this.starTimes = data;
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });
  }
}

export class StarTime {
  id: number;

  time: string;

  totalSeconds: number;

  videoUrl: string;

  starId: number;

  userName: string;
}

export class Star {
  starId: number;

  name: string;

  courseId: number;
}

export class Course {
  courseId: number;

  name: string;

  abbreviation: string;

  stars: Star[];
}
