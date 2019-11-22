import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Player } from '../../models/player'

@Component({
    selector: 'app-turn-tracker',
    templateUrl: './turn-tracker.component.html',
    styleUrls: ['./turn-tracker.component.scss']
})
export class TurnTrackerComponent implements OnInit {
    @ViewChild('name') nameInput: ElementRef;

    newPlayerName: string;
    newPlayerOrder: number;

    players: Player[] = [];
    reverseSort: boolean = false;

    started: boolean = false;
    turnsElapsed: number = 0;
    roundsElapsed: number = 0;

    constructor() {
    }

    ngOnInit() {
        this.loadPlayers();
        this.started = false;
    }

    addPlayer() {
        if (this.newPlayerName && this.newPlayerOrder) {
            let newId = this.players.length == 0 ? 1 : Math.max(...this.players.map(p => p.id)) + 1;
            this.players.push({ id: newId, name: this.newPlayerName, order: this.newPlayerOrder, isActive: false });
            this.resort();
            this.nameInput.nativeElement.focus();

            this.savePlayers();

            this.newPlayerName = null;
            this.newPlayerOrder = null;
        }
    }

    removePlayer(id: number) {
        this.players.splice(this.players.findIndex(p => p.id == id), 1);
        this.savePlayers();
    }

    loadPlayers() {
        this.players = JSON.parse(localStorage.getItem("savedPlayers"));
        if (!this.players) {
            this.players = [];
        }
        this.deactivateAllPlayers();
    }

    savePlayers() {
        localStorage.setItem("savedPlayers", JSON.stringify(this.players));
    }

    resort(changeSortOrder: boolean = false): void {
        if (changeSortOrder)
            this.reverseSort = !this.reverseSort;

        this.players.sort((a, b) => this.reverseSort ? a.order - b.order : b.order - a.order);
    }

    deactivateAllPlayers() {
        this.players.forEach(p => p.isActive = false);
    }

    startTracking() {
        if (this.players.every(p => !p.isActive)) {
            this.players[0].isActive = true;
        }

        this.started = true;
    }

    stopTracking() {
        this.deactivateAllPlayers();
        this.turnsElapsed = 0;
        this.roundsElapsed = 0;
        this.started = false;
    }

    moveToNextPlayer() {
        // Find the currently active player and deactivate them
        let activePlayerIndex = this.players.findIndex(p => p.isActive);
        this.players[activePlayerIndex].isActive = false;

        // Set the index to the next position and activate
        activePlayerIndex++;

        if (activePlayerIndex == this.players.length)
            activePlayerIndex = 0;

        this.players[activePlayerIndex].isActive = true;

        // Handle rounds and turns elapsing
        this.turnsElapsed++;
        if (activePlayerIndex == 0)
            this.roundsElapsed++;
    }
}
