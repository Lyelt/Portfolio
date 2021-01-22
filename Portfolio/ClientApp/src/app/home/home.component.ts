import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  dndName = "D&D Encounter Simulator";
  dndDesc = "A tool used for tracking initiatives and statistics during a D&D encounter.";
  dndBlog = "/blog/encounter";
  dndGit = "https://github.com/Lyelt/EncounterSimulator";

  typingName = "Typing Analyzer";
  typingDesc = "Gather interesting and useful stats about your typing patterns.";
  typingBlog = "/blog/typing";
  typingGit = "https://github.com/Lyelt/TypingAnalyzer";

  portfolioName = "My Development Portfolio";
  portfolioDesc = "This website! Includes neat web applications for some of my hobbies including bowling and speedrunning.";
  portfolioBlog = "/blog/portfolio";
  portfolioGit = "https://github.com/Lyelt/Portfolio";

  ygoName = "YGO Collection Keeper";
  ygoDesc = "A collection keeper and card lookup for a deck building trading card game called Yu-Gi-Oh!";
  ygoBlog = "/blog/yugioh";
  ygoDemo = "/yugioh";

  turnName = "Turn Tracker";
  turnDesc = "A basic tracker for turn order in board games or tabletop games.";
  turnBlog = "/blog/initiative";
  turnDemo = "/initiative";

  programmingTitle = "Programming & Back-End";
  programmingSkills = ["C# and the .NET ecosystem", "SQL Server / MySQL Databases", "Java"];

  frontendTitle = "Front-End";
  frontendSkills = ["HTML, CSS, Javascript, & jQuery", "Typescript / Angular", "Material, Bootstrap, & TailwindCSS"];

  ciTitle = "Continuous Integration & Deployment";
  ciSkills = ["Docker / dokku", "Jenkins", "Azure DevOps"];

  constructor(private router: Router) {

  }

  ngOnInit() {
  }

  navigate(url: string) {
    window.open(url, '_blank');
  }
}
