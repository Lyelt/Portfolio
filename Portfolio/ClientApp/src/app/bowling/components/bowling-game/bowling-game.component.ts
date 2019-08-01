import { Component, OnInit, Input } from '@angular/core';
import { BowlingGame } from '../../models/bowling-game';

@Component({
  selector: 'app-bowling-game',
  templateUrl: './bowling-game.component.html',
  styleUrls: ['./bowling-game.component.scss']
})
export class BowlingGameComponent implements OnInit {
  @Input() game: BowlingGame;

  constructor() { }

  ngOnInit() {
  }

}
