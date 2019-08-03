import { Component, OnInit, Input } from '@angular/core';
import { BowlingGame } from '../../models/bowling-game';
import { BowlingFrame } from '../../models/bowling-frame';

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

  getRoll1Display(frame: BowlingFrame) {
    return frame.roll1Score == 10 ? "X" :
        frame.roll1Score == 0 ? "-" :
        frame.roll1Score;
  }

  getRoll2Display(frame: BowlingFrame) {
    // If this is the 10th frame and we have just stricken, we may have X X
    if (frame.frameNumber == 10 && frame.roll2Score == 10 && frame.roll1Score == 10)
      return "X";

    // Otherwise, we're either a / or just the score itself
    return frame.roll2Score + frame.roll1Score == 10 ? "/" :
      frame.roll2Score == 0 ? "-" :
      frame.roll2Score;
  }

  getRoll3Display(frame: BowlingFrame) {
    // If this is the 10th frame and we have just stricken, we may have X X
    if (frame.roll3Score == 10 && frame.roll2Score == 10)
      return "X";

    return frame.roll3Score + frame.roll2Score == 10 ? "/" :
      frame.roll3Score == 0 ? "-" :
      frame.roll3Score;
  }
}
