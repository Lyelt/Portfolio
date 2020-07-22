import { Component, OnInit, Input } from '@angular/core';
import { YugiohCard, YugiohUtilities, CardTypeEnum } from '../../models/yugioh.model';

@Component({
    selector: 'app-selected-card',
    templateUrl: './selected-card.component.html',
    styles: []
})
export class SelectedCardComponent implements OnInit {

    @Input() card: YugiohCard;

    constructor() { }

    ngOnInit() {
    }

    getTcgLink(card: YugiohCard) {
        return YugiohUtilities.getTcgLink(card);
    }

    getSortedCardSets(card: YugiohCard) {
        return card.card_Sets.sort((a, b) => parseFloat(b.set_Price) - parseFloat(a.set_Price));
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
