import { Component, OnInit, Input } from '@angular/core';
import { BowlingSession } from '../../models/bowling-session';
import { BowlingGame } from '../../models/bowling-game';
import { BowlingUtilities } from '../../models/bowling-utilities';
import { BowlingService } from '../../services/bowling.service';
import { User } from '../../../auth/user';

@Component({
  selector: 'app-bowling-add-game',
  templateUrl: './bowling-add-game.component.html',
  styleUrls: ['./bowling-add-game.component.scss']
})
export class BowlingAddGameComponent implements OnInit {
  @Input() session: BowlingSession;
  @Input() userName: string;
  userId: string;
  filteredGames: BowlingGame[] = [];
  newGame: BowlingGame;
  bowlers: User[] = [];

  constructor(private bowlingService: BowlingService) { }

  ngOnInit() {
    if (this.userName) {
      this.selectUserByName(this.userName);
    }
    else {
      this.userId = localStorage.getItem("userId");
      this.filterGames();
    }
  }

  selectUser(userId: string) {
    this.userId = userId;
    this.filterGames();
  }

  selectUserByName(userName: string) {
    this.bowlingService.getBowlers().subscribe(data => {
      this.bowlers = data;
      const userId = this.bowlers.find(u => u.userName === userName).id;
      this.selectUser(userId);
      this.filterGames();
    });
  }

  filterGames() {
    if (this.session.games) {
      this.filteredGames = this.session.games.filter(g => g.userId === this.userId).map(game => BowlingGame.clone(game));
    }
  }

  addGame() {
    this.newGame = BowlingUtilities.newGame(this.session.id, this.filteredGames.length + 1, this.user);
  }

  saveGame(game: BowlingGame) {
    if (!this.session.games)
      this.session.games = [];

    this.bowlingService.addGameToSession(game).subscribe(data => {
      this.newGame = null;
      this.session.games.push(data);
      this.filteredGames.push(data);
    });
  }

  deleteGame(game: BowlingGame) {
    if (game.id === 0) {
      this.newGame = null;
    }
    else {
      this.bowlingService.deleteGame(game).subscribe(() => {
        this.filteredGames.splice(this.filteredGames.findIndex(g => g.id === game.id), 1);
      });
    }
  }
}
