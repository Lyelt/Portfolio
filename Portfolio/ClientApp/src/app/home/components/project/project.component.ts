import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  @Input() name: string;
  @Input() description: string;
  @Input() blogUrl: string;
  @Input() githubUrl: string;
  constructor() { }

  ngOnInit(): void {
  }

}
