import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Player } from '../../models/player'
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
    animations: [
        trigger(
            'slideButton', [
            transition(':enter', [
                style({ transform: 'translateX(-50%)', opacity: 0 }),
                animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0%)', opacity: 1 }),
                animate('500ms', style({ transform: 'translateX(50%)', opacity: 0 }))
            ]),
        ]
        ),
        trigger(
            'fade', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('100ms 500ms', style({ opacity: 1 }))
            ]),
            //transition(':leave', [
            //    style({ opacity: 1 }),
            //    animate('100ms 1000ms', style({ opacity: 0 }))
            //]),
        ]
        )
    ]
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
