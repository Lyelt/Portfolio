import { Component, OnInit, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { YugiohCard } from '../../models/yugioh.model';
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
    @Output() searchCleared = new EventEmitter<any>();
    //@Output() cardAdded = new EventEmitter<YugiohCard>();
    //@Output() cardRemoved = new EventEmitter<YugiohCard>();

    @Input() allCards?: YugiohCard[];
    @Input() collection: CardCollection;
    @Input() section: string;

    getCardsFromService: boolean = false;

    @ViewChild('auto') auto;
    constructor(private yugiohService: YugiohService) { }

    ngOnInit() {
        if (!this.allCards) {
            this.yugiohService.getAllCards().subscribe(data => {
                this.allCards = data;
                this.getCardsFromService = true;
            },
            (err) => {
                console.error(err);
                alert(err.message);
            });
        }
    }

    onFocused(e) {
        this.auto.close();
    }

    onSelected(e) {
        this.cardSelected.emit(e);
    }

    onSearch(e) {
    }

    onCleared(e) {
        this.auto.data = this.allCards;
        this.auto.close();
        this.searchCleared.emit();
    }

    getSetCard(card: YugiohCard) {
        return this.collection.cardIds.find(c => c.id == card.id);
    }

    getCardDisplay(card: YugiohCard) {
        return "$" + card.card_Prices.tcgplayer_Price + " - " + card.name;
    }

    redirectToTcgPlayer(event, card) {
        event.stopPropagation();
        let link = "https://shop.tcgplayer.com/yugioh/product/show?ProductName=" + encodeURIComponent(this.removeHtml(card.name)) + "&newSearch=false&ProductType=All&IsProductNameExact=true";
        window.open(link, '_blank');
    }

    addCard(card: Card) {
        event.stopPropagation();
        card.cardCollection = this.collection;
        card.section = this.section;

        //card.id = ygCard.id;
        //card.setCode = setCode;
        this.yugiohService.addCardToCollection(card).subscribe(data => {
            
        },
        error => {
            console.log(error);
            alert(error.error);
        });
    }

    removeCard(event, card) {
        event.stopPropagation();
    }

    searchSubmitted(e) {
        //console.log("Search: ", e);
    }

    removeHtml(str) {
        let startTagRemoved = this.replaceAll(str, "<b>", "");
        return this.replaceAll(startTagRemoved, "</b>", "");
    }

    replaceAll(str, find, replace) {
        return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    }

    escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
}
