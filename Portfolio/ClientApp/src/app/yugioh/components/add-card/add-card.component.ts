import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Card } from '../../models/card-collections';
import { YugiohCard, CardSet } from '../../models/yugioh.model';

@Component({
    selector: 'app-add-card',
    templateUrl: './add-card.component.html',
    styleUrls: ['./add-card.component.scss']
})
export class AddCardComponent implements OnInit {
    @Input() card: YugiohCard;
    @Input() setCard: Card;
    @Output() cardAdded: EventEmitter<Card> = new EventEmitter<Card>();
    @Output() cardRemoved: EventEmitter<Card> = new EventEmitter<Card>();

    selectedSet: CardSet;

    constructor() { }

    ngOnInit() {
        if (this.setCard && this.setCard.setCode) {
            this.selectedSet = this.card.card_Sets.find(s => s.set_Code == this.setCard.setCode);
        }
        else if (this.card.card_Sets) {
            let minPrice = Math.min(...this.card.card_Sets.map(c => +c.set_Price).filter(price => price > 0));
            this.selectedSet = this.card.card_Sets.find(s => +s.set_Price == minPrice);
        }
    }

    addCard(event: any) {
        event.stopPropagation();
        let addedCard = new Card();
        addedCard.id = this.card.id;
        addedCard.setCode = this.selectedSet.set_Code;
        this.cardAdded.emit(addedCard);
    }

    removeCard(event: any) {
        event.stopPropagation();
        let removedCard = new Card();
        removedCard.id = this.card.id;
        removedCard.setCode = this.selectedSet.set_Code;
        this.cardRemoved.emit(removedCard);
    }

    getQuantityDisplay() {
        if (this.setCard)
            return this.setCard.quantity;

        return 0;
    }
}
