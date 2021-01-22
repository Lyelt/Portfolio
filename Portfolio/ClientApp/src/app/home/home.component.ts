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


  constructor(private router: Router) {

  }

  ngOnInit() {
  }

  navigate(url: string) {
    window.open(url, '_blank');
  }
}
