import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { StarTime } from "../../models/star-time";
import { Course } from "../../models/course";
import { SpeedrunService } from "../../services/speedrun.service";
import { Star } from "../../models/star";

@Component({
  selector: "app-speedrun",
  templateUrl: "./speedrun.component.html",
  styleUrls: ["./speedrun.component.scss"],
})
export class SpeedrunComponent implements OnInit {
  allCourses: Course[] = [];
  courses: Course[] = [];
  categories: Course;

  expanded: number[];
  selectedStar: Star;
  compact: boolean = false;

  constructor(private srService: SpeedrunService) {

  }

  ngOnInit() {
    this.srService.getCourses().subscribe((data) => {
      this.allCourses = data || [];
      this.courses = this.allCourses.filter((c) => c.name != "Categories");
      this.categories = this.allCourses.find((c) => c.name == "Categories");
    });

    this.expanded = JSON.parse(localStorage.getItem("expandedCourses")) || [];
    this.compact = JSON.parse(localStorage.getItem("compactView")) || false;
  }

  showStarDetails(star: Star) {
    this.selectedStar = star;
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
      this.expanded.splice(this.expanded.findIndex((c) => c == course.courseId), 1);
    }

    this.cacheExpanded();
  }

  toggleCollapsed() {
    if (this.expanded.length > 0) {
      this.expanded.length = 0;
    }
    else {
      this.expanded.length = 0;
      for (let course of this.courses) {
        this.expanded.push(course.courseId);
      }
    }
      
    this.cacheExpanded();
  }

  cacheExpanded() {
    localStorage.setItem("expandedCourses", JSON.stringify(this.expanded));
  }

  changeView() {
    this.compact = !this.compact;
    localStorage.setItem("compactView", JSON.stringify(this.compact));
  }
}
