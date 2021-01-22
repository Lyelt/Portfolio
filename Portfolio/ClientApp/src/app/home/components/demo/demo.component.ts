import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {
  @Input() name: string;
  @Input() description: string;
  @Input() blogUrl: string;
  @Input() demoUrl: string;

  constructor() { }

  ngOnInit(): void {
  }

}
