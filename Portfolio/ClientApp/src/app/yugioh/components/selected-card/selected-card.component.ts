import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { YugiohCard, YugiohUtilities, CardTypeEnum, CardSet } from '../../models/yugioh.model';

@Component({
    selector: 'app-selected-card',
    templateUrl: './selected-card.component.html',
    styles: []
})
export class SelectedCardComponent implements OnInit {

    @Input() card: YugiohCard;
    @ViewChild('output') output: ElementRef;
    copying: boolean = false;

    constructor() { }

    ngOnInit() {
    }

    getCardLink() {
        return YugiohUtilities.getCardLink(this.card);
    }

    copyLinkToClipboard() {
        this.copying = true;
        this.output.nativeElement.select();
        document.execCommand("copy");
        this.copying = false;
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
        let type = YugiohUtilities.getCardType(card);
        switch (type) {
            case CardTypeEnum.Fusion:
            case CardTypeEnum.Synchro:
            case CardTypeEnum.XYZ:
            case CardTypeEnum.Monster:
                return card.atk.toString() + " / " + card.def.toString();
            case CardTypeEnum.Link:
                return card.atk.toString() + " /";
            default:
                return "N/A";
        }
    }

    getLevelLabel(card: YugiohCard) {
        let type = YugiohUtilities.getCardType(card);
        switch (type) {
            case CardTypeEnum.Link:
                return "Link Rating";
            case CardTypeEnum.XYZ:
                return "Rank";
            default:
                return "Level";
        }
    }

    getLevelDisplay(card: YugiohCard) {
        let type = YugiohUtilities.getCardType(card);
        switch (type) {
            case CardTypeEnum.Link:
                return card.linkVal;
            case CardTypeEnum.Fusion:
            case CardTypeEnum.Synchro:
            case CardTypeEnum.XYZ:
            case CardTypeEnum.Monster:
                return card.level;
            default:
                return "N/A";
        }
    }
}
