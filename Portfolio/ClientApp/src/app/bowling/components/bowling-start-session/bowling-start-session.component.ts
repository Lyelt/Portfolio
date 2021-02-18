import { Component, OnInit } from '@angular/core';
import { BowlingService } from '../../services/bowling.service';
import { BowlingSession } from '../../models/bowling-session';

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

  constructor(private bowlingService: BowlingService) {
  }

  ngOnInit() {
    this.bowlingService.sessions().subscribe(data => {
      this.sessions = data;
      this.sessions.sort((s1, s2) => new Date(s2.date).getTime() - new Date(s1.date).getTime());
    });
  }

  startAddingGames(isNew: boolean) {
    if (isNew) {
      const newSession = new BowlingSession();
      newSession.date = new Date(this.selectedDate).toISOString();

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
}
