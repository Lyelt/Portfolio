import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CardCollection, Card } from '../yugioh/models/card-collections';
import { YugiohCard, YugiohUtilities, CardTypeEnum } from '../yugioh/models/yugioh.model';
import { YugiohService } from '../yugioh/services/yugioh.service';

@Component({
    selector: 'app-view-collection',
    templateUrl: './view-collection.component.html',
    styleUrls: ['./view-collection.component.scss']
})
export class ViewCollectionComponent implements OnInit {
    //@Input() collection: CardCollection;
    //@Output() collectionClosed: EventEmitter<any> = new EventEmitter();
    //@Output() collectionModified: EventEmitter<any> = new EventEmitter();

    collection: CardCollection;
    editingSection: string;

    constructor(private ygoService: YugiohService) { }

    ngOnInit() {
        this.collection = this.ygoService.getCurrentCollection();
    }

    back() {
        this.ygoService.setCurrentCollection(null);
        //this.collectionClosed.emit();
    }

    getSubSections(section: string): CardTypeEnum[] {
        return [...new Set(
            this.getCardList(section, null)
            .map(c => YugiohUtilities.getCardType(c.ygoCard))
            .sort((t1, t2) => t1 - t2)
        )];
    }

    getSubSectionDisplay(cardType: CardTypeEnum): string {
        return YugiohUtilities.getCardTypeDisplay(cardType);
    }

    getCardList(section: string, subSection: CardTypeEnum): { ygoCard: YugiohCard, setCard: Card }[] {
        return this.collection.cards
            .sort((c1, c2) => c1.card_Prices.tcgplayer_Price - c2.card_Prices.tcgplayer_Price)
            .map(c => {
                return { ygoCard: c, setCard: this.getSetCard(c.id, section) }
            })
            .filter(c => c.setCard && (subSection ? YugiohUtilities.getCardType(c.ygoCard) == subSection : true));
    }

    getSetCard(id: number, section: string): Card {
        return this.collection.cardIds.find(c => c.id == id && (section ? c.section == section : true));
    }

    getSectionPrice(section: string): number {
        return this.collection.cards
            .map(c => {
                return { ygoCard: c, setCard: this.getSetCard(c.id, section) }
            })
            .filter(c => c.setCard)
            .reduce((sum, c) => this.round(sum + c.ygoCard.card_Prices.tcgplayer_Price * c.setCard.quantity), 0);
    }

    getCardPrice(c: { ygoCard: YugiohCard, setCard: Card }): number {
        return this.round(c.ygoCard.card_Prices.tcgplayer_Price * c.setCard.quantity);
    }

    startEditing(section: string) {
        this.editingSection = this.editingSection == section ? null : section;
    }

    getCardQuantity(section: string): number {
        return this.collection.cards
            .map(c => {
                return { ygoCard: c, setCard: this.getSetCard(c.id, section) }
            })
            .filter(c => c.setCard)
            .reduce((sum, c) => sum + c.setCard.quantity, 0);
    }

    round(amount: number): number {
        return Math.round(amount * 100) / 100;
    }
}
