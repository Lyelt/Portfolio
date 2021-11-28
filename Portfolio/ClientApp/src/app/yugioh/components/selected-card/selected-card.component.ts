import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { YugiohCard, YugiohUtilities, CardTypeEnum, CardSet } from '../../models/yugioh.model';

@Component({
    selector: 'app-selected-card',
    templateUrl: './selected-card.component.html',
    styles: []
})
export class SelectedCardComponent implements OnInit {

    @Input() card: YugiohCard;
    @Output() onBack = new EventEmitter<any>();

    constructor() { }

    ngOnInit() {
    }

    back() {
        this.onBack.emit();
    }

    getCardLink() {
        return YugiohUtilities.getCardLink(this.card);
    }

    getTcgLink(card: YugiohCard) {
        return YugiohUtilities.getTcgLink(card);
    }

    getTcgSetLink(set: CardSet) {
        return "https://shop.tcgplayer.com/price-guide/yugioh/" + encodeURIComponent(set.set_Name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/[ ]/g, "-").toLowerCase());
    }

    getSortedCardSets(card: YugiohCard) {
        if (card.card_Sets)
            return card.card_Sets.sort((a, b) => parseFloat(b.set_Price) - parseFloat(a.set_Price));
        else
            return [];
    }

    getPriceDisplay(set: CardSet) {
        return "$" + parseFloat(set.set_Price).toFixed(2).toString();
    }

    getAtkDefDisplay(card: YugiohCard) {
        return YugiohUtilities.getAtkDefDisplay(card);
    }

    getLevelLabel(card: YugiohCard) {
        return YugiohUtilities.getLevelLabel(card);
    }

    getLevelDisplay(card: YugiohCard) {
        return YugiohUtilities.getLevelDisplay(card);
    }
}
