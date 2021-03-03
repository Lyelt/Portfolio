import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user';
import { CompletedStars } from '../../models/completedStars';
import { Course } from '../../models/course';
import { Star } from '../../models/star';
import { StarTime } from '../../models/star-time';
import { SpeedrunService } from '../../services/speedrun.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
  @Input() course: Course;
  @Input() isCollapsed: boolean = false;
  @Output() collapseToggled: EventEmitter<any> = new EventEmitter();
  @Output() starSelected: EventEmitter<Star> = new EventEmitter();
  
  runners: User[] = [];
  constructor(private sr: SpeedrunService, private auth: AuthService) { }

  ngOnInit(): void {
    this.sr.getSpeedrunners().subscribe(data => {
      this.runners = data;
    });
  }

  
  getCompletedStars(course: Course): CompletedStars {
    let completed = 0;
    for (let star of course.stars) {
      if (this.sr.getStarTimes(star.starId).length == this.runners.length) {
        completed++;
      }
    }

    return {
      total: course.stars.length,
      completed: completed,
      percentage: (completed / course.stars.length) * 100,
    };
  }

  getStarCount(user: User): number {
    let count = 0;

    for (let star of this.course.stars) {
      if (this.starTimeIsFastest(star.starId, user.id)) {
        count++;
      }
    }

    return count;
  }

  getStarTime(starId: number, userId: string) {
    return this.sr.getStarTime(starId, userId);
  }

  starTimeIsFastest(starId: number, userId: string) {
    return this.sr.starTimeIsFastest(this.getStarTime(starId, userId));
  }

  calculateTimeDifference(star: Star): number {
    const currentUserId = this.auth.getLoggedInUserId();

    if (this.runners.find(u => u.id === currentUserId)) {
      const opponentUserId = this.runners.find(u => u.id !== currentUserId);

      const starTimeForCurrentUser = this.getStarTime(star.starId, currentUserId);
      const starTimeForOpponent = this.getStarTime(star.starId, opponentUserId.id);

      let differenceMs = 0;
      
      if (starTimeForCurrentUser && starTimeForOpponent) {
        differenceMs = starTimeForCurrentUser.totalMilliseconds - starTimeForOpponent.totalMilliseconds;

        return differenceMs;
      }
    }
    else {
      // Logged in user is not a speedrunner, just show the difference plainly

    }
    

    return null;
  }
  
  get orderedStars() {
    return this.course.stars
      .filter((s) => s.displayOrder >= 0)
      .sort((s1, s2) => s1.displayOrder - s2.displayOrder);
  }
}
