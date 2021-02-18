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
  constructor(private bowlingService: BowlingService) { }

  ngOnInit(): void {
    this.refreshSessions();
  }

  refreshSessions() {
    this.bowlingService.sessions().subscribe(data => {
      this.sessions = data;
      this.sessions.sort((s1, s2) => new Date(s2.date).getTime() - new Date(s1.date).getTime());
    });
  }
}
