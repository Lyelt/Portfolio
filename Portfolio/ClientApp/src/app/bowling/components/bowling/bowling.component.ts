import { Component, OnInit } from "@angular/core";
import { SeriesCategory, SeriesCategoryEnum } from "../../models/series-category";
import { BowlingUtilities } from "../../models/bowling-utilities";
import { BowlingService } from "../../services/bowling.service";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-bowling",
  templateUrl: "./bowling.component.html",
  styleUrls: ["./bowling.component.scss"],
})
export class BowlingComponent implements OnInit {
  currentUserId: string;
  currentSeriesCategory: SeriesCategory;
  categoryLabels: SeriesCategory[] = BowlingUtilities.allSeriesCategories;

  selectedStartTime: Date;
  selectedEndTime: Date;

  view: string;
  dataFound: boolean;

  constructor(private bowlingService: BowlingService, private auth: AuthService) {

  }

  ngOnInit() {
    const loggedInUser = localStorage.getItem("userId");
    this.bowlingService.getBowlers().subscribe((bowlers) => {
      if (bowlers.find((b) => b.id === loggedInUser)) {
        this.selectUser(loggedInUser);
      }
    });

    this.bowlingService.series().subscribe(data => {
        this.dataFound = (data && data.length > 0);
    });

    this.currentSeriesCategory = this.categoryLabels.find(
      (c) => c.category == SeriesCategoryEnum.SessionAverage
    );

    if ('bowling-view' in localStorage) {
      this.view = localStorage.getItem('bowling-view');
    }
    else {
      this.setView('overview');
    }
  }
  
  selectUser(userId: string) {
    this.currentUserId = userId;
    this.bowlingService.setBowlerId(this.currentUserId);
  }

  showSessionDetails(dataPoint) {
    //if (this.data && this.data.name && this.data.series) {
        //   const date = new Date(this.data.name);
        //   this.selectedSession = this.sessions.find(s => new Date(s.date).getTime() == this.data.name.getTime());
        //   this.selectedSessionUser = this.data.series;
    const user = dataPoint.series;
    const date = dataPoint.name;//.getTime() ?


  }

  userCanEdit(): boolean {
    return this.auth.userIsAdmin();
  }

  setView(view: string) {
    this.view = view;
    localStorage.setItem('bowling-view', view);
  }
}
