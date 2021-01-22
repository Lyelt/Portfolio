import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-skills-section',
  templateUrl: './skills-section.component.html',
  styleUrls: ['./skills-section.component.scss']
})
export class SkillsSectionComponent implements OnInit {
  @Input() title: string;
  @Input() skills: string[];
  constructor() { }

  ngOnInit(): void {
  }

}
