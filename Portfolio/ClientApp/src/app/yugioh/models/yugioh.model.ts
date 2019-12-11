
export class YugiohCard {
    id: number;
    name: string;
    type: string;
    desc: string;
    atk: string;
    def: string;
    level: string;
    race: string;
    attribute: string;
    scale: number;
    linkVal: number;
    linkMarkers: string[];
    card_Sets: CardSet[];
    card_Images: CardImage[];
    card_Prices: CardPrices;
    banlist_Info: BanlistInfo;
    archetype: string;
}

export class CardSet {
    set_Name: string;
    set_Code: string;
    set_Rarity: string;
    set_Price: string;
}

export class CardImage {
    id: string;
    image_Url: string;
    image_Url_Small: string;
}

export class CardPrices {
    cardmarket_Price: number;
    tcgplayer_Price: number;
    ebay_Price: number;
    amazon_Price: number;
}

export class BanlistInfo {
    ban_Tcg: string;
    ban_Ocg: string;
    ban_Goat: string;
}
