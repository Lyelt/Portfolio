import { Component, OnInit, Input } from '@angular/core';
import { BowlingSession } from '../../models/bowling-session';
import { User } from '../../../auth/user';
import { BowlingGame } from '../../models/bowling-game';

@Component({
  selector: 'app-bowling-add-game',
  templateUrl: './bowling-add-game.component.html',
  styleUrls: ['./bowling-add-game.component.scss']
})
export class BowlingAddGameComponent implements OnInit {
  @Input() session: BowlingSession;
  currentUserId: string = localStorage.getItem("userId");
  filteredGames: BowlingGame[] = [];

  constructor() { }

  ngOnInit() {

  }

  selectUser(userId: string) {

  }

  addGame() {

  }
}
