import { Component, OnInit, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { YugiohCard, YugiohUtilities, YugiohCardFilter, PropertyFilter } from '../../models/yugioh.model';
import { YugiohService } from '../../services/yugioh.service';
import { CardCollection, Card } from '../../models/card-collections';

@Component({
    selector: 'app-card-search',
    templateUrl: './card-search.component.html',
    styleUrls: ['./card-search.component.scss']
})
export class CardSearchComponent implements OnInit {
    keyword: string = "name";
    @Output() cardSelected = new EventEmitter<YugiohCard>();
    @Output() cardSearched = new EventEmitter<YugiohCardFilter>();
    @Output() searchCleared = new EventEmitter<any>();
    @Output() cardAdded = new EventEmitter<Card>();
    @Output() cardRemoved = new EventEmitter<Card>();

    @Input() placeholder?: string;
    @Input() collection: CardCollection;
    @Input() section: string;

    filteredCards: YugiohCard[];
    currentFilter: YugiohCardFilter;

    @ViewChild('auto') auto;
    constructor(private yugiohService: YugiohService) { }

    ngOnInit() {
        if (!this.placeholder)
            this.placeholder = "Search for a card";
    }

    onFocused(e) {
        this.auto.close();
    }

    onSelected(e) {
        this.cardSelected.emit(e);
    }

    onSearch(e) {
        const filters: PropertyFilter[] = [{ name: "name", value: e }];
      const filter: YugiohCardFilter = {
            pageNumber: 1,
            count: 20,
            filters: filters
        };

        this.currentFilter = filter;
        this.yugiohService.getCardsWithFilter(filter).subscribe(data => {
            this.filteredCards = data;
        });
    }

    onCleared(e) {
        this.auto.close();
        this.searchCleared.emit();
    }

    getSetCard(card: YugiohCard) {
        return this.collection.cardIds.find(c => c.id === card.id);
    }

    getCardDisplay(card: YugiohCard) {
        return "$" + card.card_Prices[0].tcgplayer_Price + " - " + card.name;
    }

    redirectToTcgPlayer(event, card) {
        event.stopPropagation();
        YugiohUtilities.redirectToTcgPlayer(card);
    }

    addCard(card: Card) {
        card.cardCollection = this.collection;
        card.section = this.section;

        this.yugiohService.addCardToCollection(card).subscribe(data => {
            this.yugiohService.setCurrentCollection(data);
            this.cardAdded.emit(card);
        });
    }

    removeCard(card: Card) {
        card.cardCollection = this.collection;
        card.section = this.section;

        this.yugiohService.removeCardFromCollection(card).subscribe(data => {
            this.yugiohService.setCurrentCollection(data);
            this.cardRemoved.emit(card);
        });
    }

    searchSubmitted() {
        this.cardSearched.emit(this.currentFilter);
        this.auto.close();
    }
}
