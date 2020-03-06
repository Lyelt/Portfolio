import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CardCollection, Card } from '../yugioh/models/card-collections';
import { YugiohCard } from '../yugioh/models/yugioh.model';

@Component({
    selector: 'app-view-collection',
    templateUrl: './view-collection.component.html',
    styleUrls: ['./view-collection.component.scss']
})
export class ViewCollectionComponent implements OnInit {

    @Input() collection: CardCollection;
    @Output() collectionClosed: EventEmitter<any> = new EventEmitter();
    constructor() { }

    ngOnInit() {
    }

    back() {
        this.collectionClosed.emit();
    }

    getCardList(section: string): { ygoCard: YugiohCard, setCard: Card }[] {
        return this.collection.cards
            .sort((c1, c2) => c1.card_Prices.tcgplayer_Price - c2.card_Prices.tcgplayer_Price)
            .map(c => {
                return { ygoCard: c, setCard: this.getSetCard(c.id, section) }
            })
            .filter(c => c.setCard);
    }

    getSetCard(id: number, section: string): Card {
        return this.collection.cardIds.find(c => c.id == id && c.section == section);
    }
}
