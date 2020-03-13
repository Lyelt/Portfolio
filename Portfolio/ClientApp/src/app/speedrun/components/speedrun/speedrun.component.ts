import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { EditStarComponent } from '../edit-star/edit-star.component';
import { Router } from '@angular/router';
import { StarTime } from '../../models/star-time';
import { Course } from '../../models/course';
import { SpeedrunService } from '../../services/speedrun.service';
import { User } from '../../../auth/user';

@Component({
  selector: 'app-speedrun',
  templateUrl: './speedrun.component.html',
  styleUrls: ['./speedrun.component.scss']
})
export class SpeedrunComponent implements OnInit {
  starTimes: StarTime[] = [];
  courses: Course[] = [];
  runners: User[] = [];

  constructor(private srService: SpeedrunService, private dialog: MatDialog, private router: Router) { }

  ngOnInit() {
    this.retrieveData();
  }

  retrieveData() {
    this.srService.getSpeedrunners().subscribe(data => {
      this.runners = data;
    });

    this.srService.getCourses().subscribe(data => {
      this.courses = data;
    });

    this.srService.getStarTimes().subscribe(data => {
      this.starTimes = data;
    });
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
        this.saveStarTime(data)
    });
  }

  saveStarTime(data: any) {
    let starTime: StarTime = data.starTime;
    starTime.time = starTime.time || "00:00:00.00"; // If not provided, use TimeSpan.Zero

    this.srService.updateStarTime(starTime).subscribe(
      result => {
      },
      () => {
        this.retrieveData();
      });
  }
}
