import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { EditStarComponent } from "../edit-star/edit-star.component";
import { Router } from "@angular/router";
import { StarTime } from "../../models/star-time";
import { Course } from "../../models/course";
import { CompletedStars } from "../../models/completedStars";
import { SpeedrunService } from "../../services/speedrun.service";
import { User } from "../../../auth/user";
import { Star } from "../../models/star";

@Component({
  selector: "app-speedrun",
  templateUrl: "./speedrun.component.html",
  styleUrls: ["./speedrun.component.scss"],
})
export class SpeedrunComponent implements OnInit {
  allCourses: Course[] = [];
  starTimes: StarTime[] = [];
  courses: Course[] = [];
  categories: Course;
  runners: User[] = [];

  expanded: number[];
  view: string = "grid";

  constructor(
    private srService: SpeedrunService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.srService.getSpeedrunners().subscribe(data => {
      this.runners = data || [];
    });

    this.srService.getCourses().subscribe((data) => {
      this.allCourses = data || [];
      this.courses = this.allCourses.filter((c) => c.name != "Categories");
      this.categories = this.allCourses.find((c) => c.name == "Categories");

      this.srService.starTimes().subscribe((data) => {
          this.starTimes = data || [];
      });
    });


    this.expanded = JSON.parse(localStorage.getItem("expandedCourses")) || [];
  }



  toggleView(view: string) {
    this.view = view;
  }

  getVisibleCourses() {
    return this.courses.filter(
      (c) => c.stars.find((s) => s.displayOrder >= 0) != null
    );
  }

  saveStarTime(data: any) {
    let starTime: StarTime = data.starTime;
    starTime.time = starTime.time || "00:00:00.00"; // If not provided, use TimeSpan.Zero

    this.srService.updateStarTime(starTime);
  }

  courseIsCollapsed(course: Course): boolean {
    return this.expanded
      ? this.expanded.find((c) => c == course.courseId) == null
      : true;
  }

  toggleCourseCollapsed(course: Course) {
    if (this.courseIsCollapsed(course)) {
      this.expanded.push(course.courseId);
    } 
    else {
      this.expanded.splice(
        this.expanded.findIndex((c) => c == course.courseId),
        1
      );
    }

    this.cacheExpanded();
  }

  collapseAll() {
      this.expanded.length = 0;
      this.cacheExpanded();
  }

  cacheExpanded() {
    localStorage.setItem("expandedCourses", JSON.stringify(this.expanded));
  }
}
