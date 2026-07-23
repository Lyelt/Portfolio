import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent {

  @Input() name: string;
  @Input() description: string;
  @Input() blogUrl: string;
  @Input() githubUrl: string;
}
