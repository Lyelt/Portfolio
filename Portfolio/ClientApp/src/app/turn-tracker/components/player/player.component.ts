import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Player } from '../../models/player'
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
    animations: [
        trigger(
            'slideButtonRight', [
            transition(':enter', [
                style({ transform: 'translateX(-50%)', opacity: 0 }),
                animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0)', opacity: 1 }),
                animate('500ms', style({ transform: 'translateX(50%)', opacity: 0 }))
            ]),
        ]
        ),
        trigger(
            'slideButtonLeft', [
            transition(':enter', [
                style({ transform: 'translateX(50%)', opacity: 0 }),
                animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(-100%)', opacity: 1 }),
                animate('500ms', style({ transform: 'translateX(-150%)', opacity: 0 }))
            ]),
        ]
        ),
        trigger(
            'fade', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('50ms 500ms', style({ opacity: 1 }))
            ])
        ]
        )
    ]
})
export class PlayerComponent implements OnInit {

    @Input() player: Player;
    @Output() playerRemoved: EventEmitter<number> = new EventEmitter<number>();
    @Output() playerEndedTurn: EventEmitter<any> = new EventEmitter<any>();
    @Output() playerPreviousTurn: EventEmitter<any> = new EventEmitter<any>();

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

    emitPlayerNavigatedBackward() {
        this.playerPreviousTurn.emit();
    }
}
