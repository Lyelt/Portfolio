import { Component, OnInit, Inject, ChangeDetectorRef, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BowlingService } from '../../services/bowling.service';
import { BowlingSession } from '../../models/bowling-session';
import { BowlingSeries, SeriesEntry } from '../../models/bowling-series';

@Component({
  selector: 'app-bowling-start-session',
  templateUrl: './bowling-start-session.component.html',
  styleUrls: ['./bowling-start-session.component.scss']
})
export class BowlingStartSessionComponent implements OnInit {
  
  sessions: BowlingSession[] = [];

  selectedSession: BowlingSession;
  selectedSessionUser: string;
  selectedDate: Date;

  selectedTabIndex = 0;

  constructor(
    private bowlingService: BowlingService,
    /*private ref: ChangeDetectorRef,
    private dialogRef: MatDialogRef<BowlingStartSessionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any*/) {

  }

  ngOnInit() {
    this.bowlingService.getSessions().subscribe(data => {
      this.sessions = data;
      this.sessions.sort((s1, s2) => new Date(s2.date).getTime() - new Date(s1.date).getTime());

      // if (this.data && this.data.name && this.data.series) {
      //   const date = new Date(this.data.name);
      //   this.selectedSession = this.sessions.find(s => new Date(s.date).getTime() == this.data.name.getTime());
      //   this.selectedSessionUser = this.data.series;
      //   this.selectedDate = date;
      //   this.changeTab(1);
      //   this.ref.detectChanges();
      // }
    });
  }

  startAddingGames() {
    if (!this.selectedSession) {
      const newSession = new BowlingSession();
      newSession.date = new Date(this.selectedDate).toDateString();//.toDateString();

      this.bowlingService.startNewSession(newSession).subscribe(data => {
        this.selectedSession = data;
        this.sessions.push(data);
        this.changeTab(1);
      });
    }
    else {
      this.changeTab(1);
    }
  }

  changeTab(index: number) {
    this.selectedTabIndex = index;
  }

  // close() {
  //   this.dialogRef.close();
  // }
}
