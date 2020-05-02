import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { EditStarComponent } from '../edit-star/edit-star.component';
import { Router } from '@angular/router';
import { StarTime } from '../../models/star-time';
import { Course } from '../../models/course';
import { CompletedStars } from '../../models/completedStars';
import { SpeedrunService } from '../../services/speedrun.service';
import { User } from '../../../auth/user';
import { Star } from '../../models/star';

@Component({
    selector: 'app-speedrun',
    templateUrl: './speedrun.component.html',
    styleUrls: ['./speedrun.component.scss']
})
export class SpeedrunComponent implements OnInit {
    allCourses: Course[] = [];
    starTimes: StarTime[] = [];
    courses: Course[] = [];
    runners: User[] = [];
    categories: Course;

    expanded: number[];
    view: string;

    constructor(private srService: SpeedrunService, private dialog: MatDialog, private router: Router) { }

    ngOnInit() {
        this.srService.getSpeedrunners().subscribe(data => {
            this.runners = data;
        });

        this.srService.getCourses().subscribe(data => {
            this.allCourses = data;
            this.courses = this.allCourses.filter(c => c.name != "Categories");
            this.categories = this.allCourses.find(c => c.name == "Categories");
        });

        this.refreshTimes();
        this.expanded = JSON.parse(localStorage.getItem('expandedCourses'));
        this.view = localStorage.getItem('view');
        if (!this.view)
            this.view = 'grid';
    }

    refreshTimes() {
        this.srService.getStarTimes().subscribe(data => {
            this.starTimes = data;
        });
    }

    getCompletedStars(course: Course): CompletedStars {
        let completed = 0;
        for (let star of course.stars) {
            if (this.starTimes.filter(st => st.starId == star.starId).length == this.runners.length)
                completed++;
        }

        return { total: course.stars.length, completed: completed, percentage: (completed / course.stars.length) * 100 };
    }

    orderStars(stars: Star[]) {
        return stars.filter(s => s.displayOrder >= 0).sort((s1, s2) => s1.displayOrder - s2.displayOrder);
    }

    toggleView(view: string) {
        this.view = view;
        localStorage.setItem('view', view);
    }

    getVisibleCourses() {
        return this.courses.filter(c => c.stars.find(s => s.displayOrder >= 0) != null);
    }

    getStarCount(user: User, course: Course): number {
        let count = 0;

        if (course) {
            for (let star of course.stars) {
                if (this.starTimeIsFastest(star.starId, user.id)) {
                    count++;
                }
            }
        }
        else {
            for (let star of this.allCourses.map(c => c.stars).reduce((a, b) => a.concat(b))) {
                if (this.starTimeIsFastest(star.starId, user.id)) {
                    count++;
                }
            }
        }

        return count;
    }

    getStarTime(starId: number, userId: string) {
        let foundTime = this.starTimes.find(st => st.starId == starId && st.userId == userId);

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
        let timesForThisStar = this.starTimes.filter(st => st.starId == starId);

        if (timesForThisStar.length > 0) {
            let minStarTime = timesForThisStar.reduce((prev, curr) => prev.totalMilliseconds < curr.totalMilliseconds ? prev : curr);
            isFastestTime = minStarTime.totalMilliseconds == starTime.totalMilliseconds;
        }

        return isFastestTime;
    }

    openDialog(starTime: StarTime, starName: string) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.data = { starTime: starTime, starName: starName };

        const dialogRef = this.dialog.open(EditStarComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(data => {
            if (data)
                this.saveStarTime(data);
        });
    }

    saveStarTime(data: any) {
        let starTime: StarTime = data.starTime;
        starTime.time = starTime.time || "00:00:00.00"; // If not provided, use TimeSpan.Zero

        this.srService.updateStarTime(starTime).subscribe(
            result => {
                this.refreshTimes();
            });
    }

    courseIsCollapsed(course: Course): boolean {
        return this.expanded ? this.expanded.find(c => c == course.courseId) == null : true;
    }

    toggleCourseCollapsed(course: Course) {
        if (!this.expanded)
            this.expanded = [];

        if (this.courseIsCollapsed(course))
            this.expanded.push(course.courseId);
        else
            this.expanded.splice(this.expanded.findIndex(c => c == course.courseId));

        localStorage.setItem('expandedCourses', JSON.stringify(this.expanded));
    }
}
