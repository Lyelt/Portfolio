import { Component, OnInit, ViewChild } from '@angular/core';
import { YugiohService } from '../../services/yugioh.service';
import { YugiohCard } from '../../models/yugioh.model';
import { Card, CardCollection } from '../../models/card-collections';

@Component({
    selector: 'app-yugioh',
    templateUrl: './yugioh.component.html',
    styleUrls: ['./yugioh.component.scss']
})
export class YugiohComponent implements OnInit {
    currentUserId: string;

    selectedCard: YugiohCard;
    selectedCollection: CardCollection;

    constructor(private yugiohService: YugiohService) { }
    
    ngOnInit() {
        this.currentUserId = localStorage.getItem("userId");
    }

    selectUser(user) {

    }

    cardSelected(card) {
        this.selectedCard = card;
    }

    searchCleared() {
        this.selectedCard = null;
    }

    addCardToCollection(card: YugiohCard) {
        let cardInCollection: Card = { cardCollection: this.selectedCollection, id: card.id };
        this.yugiohService.addCardToCollection(cardInCollection);
    }

    isLoggedIn() {
        return localStorage.getItem('jwt');
    }
}
