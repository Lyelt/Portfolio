import { Component, OnInit, Input } from '@angular/core';
import { BowlingSession } from '../../models/bowling-session';
import { BowlingGame } from '../../models/bowling-game';
import { BowlingUtilities } from '../../models/bowling-utilities';
import { BowlingService } from '../../services/bowling.service';

@Component({
  selector: 'app-bowling-add-game',
  templateUrl: './bowling-add-game.component.html',
  styleUrls: ['./bowling-add-game.component.scss']
})
export class BowlingAddGameComponent implements OnInit {
  @Input() session: BowlingSession;
  currentUserId: string = localStorage.getItem("userId");
  filteredGames: BowlingGame[] = [];
  newGame: BowlingGame;

  constructor(private bowlingService: BowlingService) { }

  ngOnInit() {
    this.filterGames();
  }

  selectUser(userId: string) {
    this.currentUserId = userId;
    this.filterGames();
  }

  filterGames() {
    if (this.session.games) {
      this.filteredGames = this.session.games.filter(g => g.userId == this.currentUserId).map(game => BowlingGame.clone(game));
    }
  }

  addGame() {
    this.newGame = BowlingUtilities.newGame(this.session.id, this.filteredGames.length + 1, this.currentUserId);
  }

  saveGame(game: BowlingGame) {
    this.bowlingService.addGameToSession(game).subscribe(data => {
      this.newGame = null;
      this.filteredGames.push(data);
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });
  }

  deleteGame(game: BowlingGame) {
    if (game.id == 0) {
      this.newGame = null;
    }
    else {
      this.bowlingService.deleteGame(game).subscribe(data => {
        this.filteredGames.splice(this.filteredGames.findIndex(g => g.id == game.id), 1);
      });
    }
  }
}
