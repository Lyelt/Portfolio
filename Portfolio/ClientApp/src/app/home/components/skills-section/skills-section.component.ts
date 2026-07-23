import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-skills-section',
  templateUrl: './skills-section.component.html',
  styleUrls: ['./skills-section.component.scss']
})
export class SkillsSectionComponent {
  @Input() title: string;
  @Input() skills: string[];
}
