import { Component, OnInit  } from '@angular/core';
import { SpeedrunService } from '../speedrun.service';
import { User } from '../auth/user';

@Component({
  selector: 'app-speedrun',
  templateUrl: './speedrun.component.html',
  styleUrls: ['./speedrun.component.scss']
})
export class SpeedrunComponent implements OnInit {
  starTimes: StarTime[] = [];
  courses: Course[] = [];
  runners: User[] = [];
  starTimeMap: Map<number, Map<string, StarTime>> = new Map<number, Map<string, StarTime>>();

  constructor(private srService: SpeedrunService) { }

  ngOnInit() {
    this.retrieveData();
  }

  retrieveData() {
    this.srService.getSpeedrunners().subscribe(data => {
      this.runners = data;
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });

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

  getStarTime(starId: number, userId: string) {
    return this.starTimes.find(st => st.starId == starId && st.userId == userId);
  }
}

export class StarTime {
  time: string;

  timeDisplay: string;

  totalSeconds: number;

  lastUpdated: Date;

  videoUrl: string;

  starId: number;

  userId: string;
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
