import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

    @Input() name: string;
    @Input() order: number;

    active: boolean = true;

    constructor() { }

    ngOnInit() {
    }

}
