import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BowlingGame } from '../../models/bowling-game';
import { BowlingFrame } from '../../models/bowling-frame';
import { BowlingUtilities } from '../../models/bowling-utilities';

export class BowlingScore {
  display: string;
  value: number;
  show: boolean;
}

@Component({
  selector: 'app-bowling-game',
  templateUrl: './bowling-game.component.html',
  styleUrls: ['./bowling-game.component.scss']
})
export class BowlingGameComponent implements OnInit {
  @Input() game: BowlingGame;
  @Output() gameSaved: EventEmitter<BowlingGame> = new EventEmitter();

  currentFrame: number = 1;
  currentRoll: number = 1;

  possibleScores: BowlingScore[] = [
    { display: "-", value: 0, show: true },
    { display: "1", value: 1, show: true  },
    { display: "2", value: 2, show: true  },
    { display: "3", value: 3, show: true  },
    { display: "4", value: 4, show: true  },
    { display: "5", value: 5, show: true  },
    { display: "6", value: 6, show: true  },
    { display: "7", value: 7, show: true  },
    { display: "8", value: 8, show: true  },
    { display: "9", value: 9, show: true  },
    { display: "X", value: 10, show: true  }
  ];
  constructor() { }

  ngOnInit() {
  }

  getScoresToDisplay() {
    return this.possibleScores.filter(s => s.show);
  }

  addScore(score: number) {
    let frame = this.game.getFrame(this.currentFrame);

    this.possibleScores.forEach(s => s.show = (score == 10 || s.value < (10 - score)) || (this.currentRoll == 2 && this.currentFrame != 10));
    if (score != 10 && (this.currentRoll == 1 || this.currentFrame == 10)) {
      this.possibleScores.push({ display: "/", value: (10 - score), show: true });
    }
    else if (this.possibleScores.find(s => s.display == "/")) {
      this.possibleScores.pop();
    }

    if (this.currentRoll == 1) {
      frame.roll1Score = score;

      if (score != 10 || this.currentFrame == 10) {
        this.currentRoll++;
      }
      else if (this.currentFrame != 10) {
        this.currentFrame++;
      }
    }
    else if (this.currentRoll == 2) {
      frame.roll2Score = score;

      if (this.currentFrame != 10) {
        this.currentFrame++;
        this.currentRoll = 1;
      }
      else if (score == 10 || frame.roll1Score + score == 10) {
        this.currentRoll++;
      }
    }
    else {
      frame.roll3Score = score;
    }

    let scoreSoFar = this.getScoreSoFar(this.game, frame);
    this.game.totalScore = scoreSoFar == "" ? 0 : scoreSoFar as number;
  }

  back() {
    let game = this.game.getFrame(this.currentFrame);
    game.roll1Score = null;
    game.roll2Score = null;
    game.roll3Score = null;

    if (this.currentFrame > 1)
      this.currentFrame--;
    this.currentRoll = 1;
  }

  save() {
    this.gameSaved.emit(this.game);
  }

  getScoreSoFar(game: BowlingGame, frame: BowlingFrame) {
    let score = BowlingUtilities.getScoreSoFar(game, frame);
    return score ? score : "";
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
    return frame.roll3Score == 10 ? "X" :
      frame.roll3Score + frame.roll2Score == 10 ? "/" :
      frame.roll3Score == 0 ? "-" :
      frame.roll3Score;
  }
}
