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
  allSessions: BowlingSession[] = [];
  filteredSessions: BowlingSession[] = [];
  bowlingDataSeries: BowlingSeries[] = [];
  bowlers: User[] = [];
  quickStats: BowlingStat[] = [];
  currentUserId: string;

  constructor(private bowlingService: BowlingService, private router: Router) { }

  ngOnInit() {
    this.currentUserId = localStorage.getItem("userId");

    this.bowlingService.getBowlers().subscribe(data => {
      this.bowlers = data;
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });

    this.bowlingService.getSessions().subscribe(data => {
      this.allSessions = data;
      this.selectUser();

      this.bowlingDataSeries = this.bowlers.map(b => new BowlingSeries(this.allSessions, b));
      console.log(this.bowlingDataSeries);
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });
  }

  selectUser() {
    this.filteredSessions = this.allSessions.map(session => ({ ...session }));

    for (let session of this.filteredSessions) {
      if (this.currentUserId) {
        session.games = session.games.filter(g => g.userId == this.currentUserId);
      }
    }

    this.sortData();
    this.retrieveStats();
  }

  retrieveStats() {
    this.bowlingService.getQuickStats(this.currentUserId).subscribe(data => {
      this.quickStats = data;
    },
      (err) => {
        console.error(err);
        alert(err.message);
      });
  }

  sortData() {
    for (let session of this.filteredSessions) {
      session.games.sort((g1, g2) => g1.gameNumber - g2.gameNumber);
      for (let game of session.games) {
        game.frames.sort((f1, f2) => f1.frameNumber - f2.frameNumber);
      }
    }
  }
}

export class BowlingSeries {
  public name: string;
  public series: SeriesEntry[];

  constructor(sessions: BowlingSession[], user: User) {
    this.name = user.userName;
    let filterUserGames = games => games.filter(g => g.userId == user.id);
    this.series = sessions.filter(s => filterUserGames(s.games).length > 0).map(s => new SeriesEntry(filterUserGames(s.games), s.date));
  }
}

export class SeriesEntry {
  public name: Date;
  public value: number;

  constructor(games: BowlingGame[], date: Date) {
    this.name = new Date(date);

    let sum = 0;
    for (let game of games) {
      sum += game.totalScore;
    }

    this.value = sum / games.length;
  }
}

//[
//{
//  name: 'Nick',
//  series: [
//    {
//      name: '2019-07-25',
//      value: '167'
//    },
//    {
//      ...
//    }
//  ]
//},
// etc..
//]

export class BowlingStat {
  name: string;

  value: number;

  unit: string;

  details: string;
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
