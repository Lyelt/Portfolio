export class PropertyFilter {
    name: string;
    value?: string;
    highValue?: number;
    lowValue?: number;
}

export class YugiohCardFilter {
    filters: PropertyFilter[];

    pageNumber: number;

    count: number;
}

export class YugiohCard {
  id: number;
  name: string;
  type: string;
  desc: string;
  atk: number;
  def: number;
  level: number;
  race: string;
  attribute: string;
  scale: number;
  linkVal: number;
  linkMarkers: string[];
  card_Sets: CardSet[];
  card_Images: CardImage[];
  card_Prices: CardPrices[];
  banlist_Info: BanlistInfo;
  archetype: string;
}

export class CardSet {
  set_Name: string;
  set_Code: string;
  set_Rarity: string;
  set_Rarity_Code: string;
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
  coolstuffinc_price: number;
}

export class BanlistInfo {
    ban_Tcg: string;
    ban_Ocg: string;
    ban_Goat: string;
}

export enum CardTypeEnum {
    Monster,
    Spell,
    Trap,
    Link,
    XYZ,
    Synchro,
    Fusion
}

export class CardType {
    deckSection: string;
    cardType: CardTypeEnum;
}

export abstract class YugiohUtilities {
  public static getCardLink(card: YugiohCard): string {
    return window.location.hostname + "/yugioh/" + card.id;
  }

  public static getCardType(card: YugiohCard): CardTypeEnum {
    if (card.type.includes('Trap'))
      return CardTypeEnum.Trap;
    if (card.type.includes('Spell'))
      return CardTypeEnum.Spell;
    if (card.type.includes('Fusion'))
      return CardTypeEnum.Fusion;
    if (card.type.includes('Synchro'))
      return CardTypeEnum.Synchro;
    if (card.type.includes('XYZ'))
      return CardTypeEnum.XYZ;
    if (card.type.includes('Link'))
      return CardTypeEnum.Link;

    return CardTypeEnum.Monster;
  }

  public static getCardTypeDisplay(cardType: CardTypeEnum): string {
    switch (cardType) {
      case CardTypeEnum.Monster:
      case CardTypeEnum.Spell:
      case CardTypeEnum.Trap:
        return CardTypeEnum[cardType] + 's';
      default:
        return CardTypeEnum[cardType];
    }
  }

  public static redirectToTcgPlayer(card: YugiohCard) {
    window.open(this.getTcgLink(card), '_blank');
  }

  public static getTcgLink(card: YugiohCard): string {
    return "https://shop.tcgplayer.com/yugioh/product/show?ProductName=" + encodeURIComponent(this.removeHtml(card.name)) + "&newSearch=false&ProductType=All&IsProductNameExact=true";
  }

  private static removeHtml(str) {
    const startTagRemoved = this.replaceAll(str, "<b>", "");
    return this.replaceAll(startTagRemoved, "</b>", "");
  }

  private static replaceAll(str, find, replace) {
    return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
  }

  private static escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }
}
