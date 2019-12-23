import { Component, OnInit, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { YugiohCard } from '../../models/yugioh.model';
import { YugiohService } from '../../services/yugioh.service';

@Component({
    selector: 'app-card-search',
    templateUrl: './card-search.component.html',
    styleUrls: ['./card-search.component.scss']
})
export class CardSearchComponent implements OnInit {
    keyword: string = "name";
    @Output() cardSelected = new EventEmitter<YugiohCard>();
    @Output() searchCleared = new EventEmitter<any>();

    @Input() allCards?: YugiohCard[];

    getCardsFromService: boolean = false;

    @ViewChild('auto') auto;
    constructor(private yugiohService: YugiohService) { }

    ngOnInit() {
        //if (!this.allCards) {
        //    this.yugiohService.getAllCards().subscribe(data => {
        //        this.allCards = data;
        //        this.getCardsFromService = true;
        //    },
        //    (err) => {
        //        console.error(err);
        //        alert(err.message);
        //    });
        //}
    }

    onFocused(e) {
        this.auto.close();
    }

    onSelected(e) {
        this.cardSelected.emit(e);
    }

    onSearch(e) {
        if (!this.allCards) {
            this.yugiohService.getCardsWithFilter(e).subscribe(data => {
                this.auto.data = data;
            },
            (err) => {
                console.error(err);
                alert(err.message);
            });
        }
    }

    onCleared(e) {
        this.auto.data = this.allCards;
        this.auto.close();
        this.searchCleared.emit();
    }

    getCardDisplay(card: YugiohCard) {
        return "$" + card.card_Prices.tcgplayer_Price + " - " + card.name;
    }

    searchSubmitted(e) {
        console.log("Search: ", e);
    }
}
