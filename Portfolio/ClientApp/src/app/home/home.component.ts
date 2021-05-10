import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  projects: Project[] = [
    { name: "D&D Encounter Simulator", description: "A tool used for tracking initiatives and statistics during a D&D encounter.", blogUrl: "/blog/encounter", viewUrl: "https://github.com/Lyelt/EncounterSimulator" },
    { name: "Typing Analyzer", description: "Gather interesting and useful stats about your typing patterns.", blogUrl: "https://trello.com/c/9eS9U7oW/31-requirements", viewUrl: "https://github.com/Lyelt/TypingAnalyzer" },
    { name: "My Development Portfolio", description: "This website! Includes neat web applications for some of my hobbies including bowling and speedrunning.", blogUrl: "/blog/portfolio", viewUrl: "https://github.com/Lyelt/Portfolio" },
  ];

  demos: Project[] = [
    { name: "Bowling Statistics", description: "Tracking bowling scores and visualizing interesting statistics.", blogUrl: "/blog/bowling", viewUrl: "/bowling" },
    { name: "Yu-Gi-Oh! Collections", description: "A collection keeper and card lookup for a deck building trading card game called Yu-Gi-Oh!", blogUrl: "/blog/yugioh", viewUrl: "/yugioh" },
    { name: "Speedrun Competition", description: "Comparing Super Mario 64 speedrun times with a friend.", blogUrl: "/blog/speedrun", viewUrl: "/speedrun" },
    { name: "Turn Tracker", description: "A basic tracker for turn order in board games or tabletop games.", blogUrl: "/blog/initiative", viewUrl: "/initiative" },
  ];

  skills: Skill[] = [
    { title: "Programming & Back-End", skills: ["C# and the .NET ecosystem", "SQL Server / MySQL Databases", "Java"]},
    { title: "Front-End", skills: ["HTML, CSS, Javascript, & jQuery", "Typescript / Angular", "Material, Bootstrap, & TailwindCSS"]},
    { title: "Continuous Integration & Deployment", skills: ["Docker / dokku", "Jenkins", "Azure DevOps"]},
  ];

  constructor(private router: Router) {

  }

  ngOnInit() {
  }

  navigate(url: string) {
    window.open(url, '_blank');
  }
}

class Project {
  name: string;
  description: string;
  blogUrl: string;
  viewUrl: string;
}

class Skill {
  title: string;
  skills: string[];
}
