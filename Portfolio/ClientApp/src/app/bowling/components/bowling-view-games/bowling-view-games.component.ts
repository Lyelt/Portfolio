import { Component, OnInit } from '@angular/core';
import { BowlingSession } from '../../models/bowling-session';
import { BowlingService } from '../../services/bowling.service';

@Component({
  selector: 'app-bowling-view-games',
  templateUrl: './bowling-view-games.component.html',
  styleUrls: ['./bowling-view-games.component.scss']
})
export class BowlingViewGamesComponent implements OnInit {
  sessions: BowlingSession[] = [];
  pageNumber: number = 1;
  entriesPerPage: number = 10;

  sortType: string = "date";
  openSession: BowlingSession;

  constructor(private bowlingService: BowlingService) { }

  ngOnInit(): void {
    this.refreshSessions();
  }

  refreshSessions() {
    this.bowlingService.sessions().subscribe(data => {
      this.sessions = data;
      this.pageNumber = 1;
      this.sortSessions();
    });
  }

  open(session: BowlingSession) {
    this.openSession = session;
  }

  back() {
    this.openSession = null;
  }

  sortSessions() {
    if (this.sortType === "date") {
      this.sessions.sort((s1, s2) => new Date(s2.date).getTime() - new Date(s1.date).getTime());
    }
  }

  setPage(pageNumber: number) {
    this.pageNumber = pageNumber <= 0 ? 1 : pageNumber;
    if (this.start >= this.sessions.length) {
      this.setPage(this.pageNumber - 1);
    }
  }

  getSessionPage() {
    return this.sessions.slice(this.start - 1, this.end);
  }

  get start() {
    return (this.pageNumber - 1) * this.entriesPerPage + 1;
  }

  get end() {
    const end = this.pageNumber * this.entriesPerPage;
    return this.entriesPerPage < 0 ? null : end > this.sessions.length ? this.sessions.length : end;
  }

  getSessionTotal(session: BowlingSession): number {
    return session.games.reduce((a, b) => a + b.totalScore, 0);
  }
}
