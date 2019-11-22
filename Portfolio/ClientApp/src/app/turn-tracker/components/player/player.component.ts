import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Player } from '../../models/player'

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

    @Input() player: Player;
    @Output() playerRemoved: EventEmitter<number> = new EventEmitter<number>();
    @Output() playerEndedTurn: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
    }

    ngOnInit() {
    }

    emitPlayerRemoved() {
        this.playerRemoved.emit(this.player.id);
    }

    emitPlayerEndedTurn() {
        this.playerEndedTurn.emit();
    }
}
