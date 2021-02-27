import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/auth/user';
import { CompletedStars } from '../../models/completedStars';
import { Course } from '../../models/course';
import { Star } from '../../models/star';
import { StarTime } from '../../models/star-time';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
  @Input() course: Course;
  @Input() starTimes: StarTime[];
  @Input() runners: User[];
  @Input() isCollapsed: boolean = false;
  @Output() collapseToggled: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  
  getCompletedStars(course: Course): CompletedStars {
    let completed = 0;
    for (let star of course.stars) {
      if (this.starTimes.filter((st) => st.starId == star.starId).length == this.runners.length) {
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
    // else {
    //   for (let star of this.allCourses
    //     .map((c) => c.stars)
    //     .reduce((a, b) => a.concat(b))) {
    //     if (this.starTimeIsFastest(star.starId, user.id)) {
    //       count++;
    //     }
    //   }
    // }

    return count;
  }

  getStarTime(starId: number, userId: string) {
    let foundTime = this.starTimes.find(
      (st) => st.starId == starId && st.userId == userId
    );

    if (!foundTime) {
      foundTime = new StarTime();
      foundTime.userId = userId;
      foundTime.starId = starId;
    }

    return foundTime;
  }

  starTimeIsFastest(starId: number, userId: string) {
    let isFastestTime = false;
    let starTime = this.getStarTime(starId, userId);
    let timesForThisStar = this.starTimes.filter((st) => st.starId == starId);

    if (timesForThisStar.length > 0) {
      let minStarTime = timesForThisStar.reduce((prev, curr) =>
        prev.totalMilliseconds < curr.totalMilliseconds ? prev : curr
      );
      isFastestTime =
        minStarTime.totalMilliseconds == starTime.totalMilliseconds;
    }

    return isFastestTime;
  }

  openDialog(starTime: StarTime, starName: string) {
    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.autoFocus = true;
    // dialogConfig.data = { starTime: starTime, starName: starName };

    // const dialogRef = this.dialog.open(EditStarComponent, dialogConfig);

    // dialogRef.afterClosed().subscribe((data) => {
    //   if (data) {
    //     this.saveStarTime(data);
    //   }
    // });
  }

  get orderedStars() {
    return this.course.stars
      .filter((s) => s.displayOrder >= 0)
      .sort((s1, s2) => s1.displayOrder - s2.displayOrder);
  }
}
