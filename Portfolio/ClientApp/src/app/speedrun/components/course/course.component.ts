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
      if (star.name === "Stage RTA" || star.displayOrder < 0) continue;

      if (this.sr.getStarTimes(star.starId).length == this.runners.length) {
        completed++;
      }
    }

    const total = course.stars.filter(s => s.name !== "Stage RTA" && s.displayOrder >= 0).length;
    return {
      total: total,
      completed: completed,
      percentage: (completed / total) * 100,
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

  calculateTimeDifference(starOrCourse: any): number {
    const currentUserId = this.auth.getLoggedInUserId();

    if (this.runners.find(u => u.id === currentUserId)) {
      const opponent = this.runners.find(u => u.id !== currentUserId);
      if (starOrCourse.starId) {
        return this.getTimeDiff(starOrCourse, currentUserId, opponent.id);
      }
      else if (starOrCourse.stars) {
        let diff = 0;
        for (let star of starOrCourse.stars.filter(s => s.name !== "Stage RTA")) {
          diff += this.getTimeDiff(star, currentUserId, opponent.id) || 0;
        }
        return diff;
      }
    }
    
    return null;
  }

  private getTimeDiff(star: Star, currentUserId: string, opponentUserId: string): number {
    const starTimeForCurrentUser = this.getStarTime(star.starId, currentUserId);
    const starTimeForOpponent = this.getStarTime(star.starId, opponentUserId);

    let differenceMs = 0;
    
    if (starTimeForCurrentUser && starTimeForOpponent) {
      differenceMs = starTimeForCurrentUser.totalMilliseconds - starTimeForOpponent.totalMilliseconds;
      return differenceMs;
    }

    return null;
  }
  
  get orderedStars(): Star[] {
    return this.course.stars
      .filter((s) => s.displayOrder >= 0)
      .sort((s1, s2) => s1.displayOrder - s2.displayOrder);
  }

  get userIsSpeedrunner(): boolean {
    return this.runners.find(u => u.id === this.auth.getLoggedInUserId()) != null;
  }
}
