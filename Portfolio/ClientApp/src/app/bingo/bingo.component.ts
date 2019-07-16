import { Component, OnInit } from '@angular/core';
import { SpeedrunService } from '../speedrun.service';
import { BingoService } from '../bingo.service';

@Component({
  selector: 'app-bingo',
  templateUrl: './bingo.component.html',
  styleUrls: ['./bingo.component.scss']
})
export class BingoComponent implements OnInit {
  courses: BingoCourse[] = [];
  secrets: SecretCategory[] = [];
  stageStars: StageStar[] = [];
  cannonsOpened: number = 0;
  secretsCompleted: number = 0;
  hundredsCompleted: number = 0;

  constructor(private bingoService: BingoService) { }

  ngOnInit() {
    this.retrieveData();
  }

  retrieveData() {
    this.courses = [
      { name: "BoB", hasCannon: true },
      { name: "WF", hasCannon: true },
      { name: "JRB", hasCannon: true },
      { name: "CCM", hasCannon: true },
      { name: "BBH", hasCannon: false },
      { name: "HMC", hasCannon: false },
      { name: "LLL", hasCannon: false },
      { name: "SSL", hasCannon: true },
      { name: "DDD", hasCannon: false },
      { name: "SL", hasCannon: true },
      { name: "WDW", hasCannon: true },
      { name: "TTM", hasCannon: true },
      { name: "THI", hasCannon: true },
      { name: "TTC", hasCannon: false },
      { name: "RR", hasCannon: true }
    ];

    this.secrets = [
      {
        name: "Slides", stars: [
          { name: "Slide 1" },
          { name: "Slide 2" }
        ]
      },
      {
        name: "Bowser Reds", stars: [
          { name: "BitDW Reds" },
          { name: "BitFS Reds" },
          { name: "BitS Reds" }
        ]
      },
      {
        name: "Cap Stage Reds", stars: [
          { name: "Wing Cap Reds" },
          { name: "Invis Cap Reds" },
          { name: "Metal Cap Reds" }
        ]
      },
      {
        name: "Toad Stars", stars: [
          { name: "Toad 1 (12 stars)" },
          { name: "Toad 2 (25 stars)" },
          { name: "Toad 3 (35 stars)" }
        ]
      },
      {
        name: "Secret Reds", stars: [
          { name: "Aquarium Reds" },
          { name: "Cloud Stage Reds" }
        ]
      },
      {
        name: "Mips", stars: [
          { name: "Mips 1 (15 stars)" },
          { name: "Mips 2 (50 stars)" }
        ]
      }
    ];

    this.stageStars = [
      { name: "Star 1" },
      { name: "Star 2" },
      { name: "Star 3" },
      { name: "Star 4" },
      { name: "Star 5" },
      { name: "Star 6" }
    ];
  }

  reset() {
    this.cannonsOpened = 0;
    this.secretsCompleted = 0;
    this.hundredsCompleted = 0;

    this.bingoService.resetComponents();
  }

  hundredToggled(completed: boolean) {
    this.hundredsCompleted += completed ? 1 : -1;
  }

  secretToggled(completed: boolean) {
    this.secretsCompleted += completed ? 1 : -1;
  }

  cannonToggled(completed: boolean) {
    this.cannonsOpened += completed ? 1 : -1;
  }
}

export class BingoCourse {
  name: string;
  hasCannon: boolean;
}

export class SecretCategory {
  name: string;

  stars: SecretStar[];
}

export class SecretStar {
  name: string;
}

export class StageStar {
  name: string;
}
