import { BowlingGame } from './bowling-game';
import { User } from '../../auth/user';
import { BowlingSession } from './bowling-session';

export class BowlingSeries {
  public name: string;
  public series: SeriesEntry[];

  constructor(sessions: BowlingSession[], user: User) {
    this.name = user.userName;
    let filterUserGames = games => games.filter(g => g.userId == user.id);
    this.series = sessions.filter(s => filterUserGames(s.games).length > 0).map(s => new SeriesEntry(filterUserGames(s.games), new Date(s.date)));
  }
}

export class SeriesEntry {
  public name: Date;
  public value: number;

  constructor(games: BowlingGame[], date: Date) {
    this.name = date;

    let sum = 0;
    for (let game of games) {
      sum += game.totalScore;
    }

    this.value = sum / games.length;
  }
}
