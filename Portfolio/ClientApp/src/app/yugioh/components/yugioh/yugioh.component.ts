import { Component, OnInit, ViewChild } from '@angular/core';
import { YugiohService } from '../../services/yugioh.service';
import { YugiohCard } from '../../models/yugioh.model';

@Component({
    selector: 'app-yugioh',
    templateUrl: './yugioh.component.html',
    styleUrls: ['./yugioh.component.scss']
})
export class YugiohComponent implements OnInit {

    keyword: string = "name";
    allCards: YugiohCard[];
    constructor(private yugiohService: YugiohService) { }
    @ViewChild('auto') auto;
    
    ngOnInit() {
        this.yugiohService.getAllCards().subscribe(data => {
            this.allCards = data;
        },
        (err) => {
            console.error(err);
            alert(err.message);
        });
    }

    test() {
        this.yugiohService.test();
    }

    onFocused(e) {
        this.auto.close();
    }

    onSelected(e) {
        console.log(e);
    }

    onSearch(e) {
        console.log(e);
    }

    onCleared(e) {
        this.auto.close();
    }

    getCardDisplay(card: YugiohCard) {
        return "$" + card.card_Prices.tcgplayer_Price + " - " + card.name;
    }
}
