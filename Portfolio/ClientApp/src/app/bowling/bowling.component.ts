import { Component, OnInit } from '@angular/core';
import { BowlingService } from '../bowling.service';
import { Router } from '@angular/router';
import { User } from '../auth/user';

@Component({
  selector: 'app-bowling',
  templateUrl: './bowling.component.html',
  styleUrls: ['./bowling.component.scss']
})
export class BowlingComponent implements OnInit {
  sessions: BowlingSession[] = [];
  bowlers: User[] = [];

  constructor(private bowlingService: BowlingService, private router: Router) { }

  ngOnInit() {
    this.bowlingService.getBowlers().subscribe(data => {
      this.bowlers = data;
    },
    (err) => {
      console.error(err);
      alert(err.message);
      });

    this.bowlingService.getSessions().subscribe(data => {
      this.sessions = data;
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });
  }
}

export class BowlingSession {
  id: number;

  date: Date;

  games: BowlingGame[];
}

export class BowlingGame {
  id: number;

  userId: string;

  sessionId: number;

  totalScore: number;

  gameNumber: number;

  frames: BowlingFrame[];
}

export class BowlingFrame {
  id: number;

  gameId: number;

  frameNumber: number;

  roll1Score: number;

  roll2Score: number;

  roll3Score: number;

  isSplit: boolean;
}
