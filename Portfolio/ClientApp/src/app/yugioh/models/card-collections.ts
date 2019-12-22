import { YugiohCard } from './yugioh.model';

export class CardCollection {
    id: number;
    name: string;
    userId: string;
    cardIds: Card[];
    cards: YugiohCard[];
}


export class Card {
    id: number;
    cardCollection: CardCollection;
}
