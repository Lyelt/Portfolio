import { Component, OnInit } from '@angular/core';
import { GameNightService } from '../../services/game-night.service';
import { GameNight, GameNightGame } from '../../models/game-night';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {
  public games: GameNightGame[] = [];
  public form: FormGroup;
  public addedGame: GameNightGame = new GameNightGame();
  public addingGames: boolean = false;

  constructor(private gnService: GameNightService, private fb: FormBuilder) {
    this.gnService.games().subscribe(data => {
      this.games = data;
    });
  }

  ngOnInit() {
    this.buildForm();
  }

  private buildForm() {
    this.form = this.fb.group({
      name: [this.addedGame.name, Validators.required],
      minPlayers: [this.addedGame.minPlayers, Validators.required],
      maxPlayers: [this.addedGame.maxPlayers, Validators.required]
    });
  }

  public gameNightBelongsToLoggedInUser(): boolean {
    return this.gnService.gameNightBelongsToLoggedInUser();
  }

  public getSelectedGameNight(): GameNight {
    return this.gnService.selectedGameNight;
  }

  public isGameSelected(game: GameNightGame): boolean {
    const gn = this.getSelectedGameNight();
    return gn && gn.games.filter(g => g.id === game.id).length > 0;
  }

  public toggleGameSelected(game: GameNightGame) {
    if (!this.gameNightBelongsToLoggedInUser()) {
      return;
    }

    var gnGames = this.getSelectedGameNight().games;
    if (!this.isGameSelected(game)) {
      gnGames.push(game);
    }
    else {
      gnGames.splice(gnGames.findIndex(g => g.id === game.id, 0));
    }

    this.gnService.saveGames(this.getSelectedGameNight());
  }

  public addGame() {
    this.gnService.addGame(this.form.value);
    this.form.reset();
  }

}
