import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/auth/user';
import { Course } from '../../models/course';
import { Star } from '../../models/star';
import { ArchivedStarTime } from '../../models/star-time';
import { SpeedrunService } from '../../services/speedrun.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit {
  runners: User[] = [];
  archivedStarTimes: ArchivedStarTime[] = [];
  courses: Course[] = [];

  constructor(private speedrunService: SpeedrunService) { }

  ngOnInit(): void {
    this.speedrunService.getSpeedrunners().subscribe(data => {
      this.runners = data;
      
      this.speedrunService.getCourses().subscribe(data => {
        this.courses = data;
      
        this.speedrunService.archivedStarTimes().subscribe(data => {
          this.archivedStarTimes = data;
        });
      });
    });
  }

  getStarById(starId: number): Star {
    return this.courses.flatMap(c => c.stars).find(s => s.starId === starId);
  }

  getUserById(userId: string): User {
    return this.runners.find(u => u.id === userId);
  }
}
