import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CardCollection, Card } from '../../models/card-collections';
import { YugiohCard, YugiohUtilities, CardTypeEnum } from '../../models/yugioh.model';
import { YugiohService } from '../../services/yugioh.service';

@Component({
  selector: 'app-view-collection',
  templateUrl: './view-collection.component.html',
  styleUrls: ['./view-collection.component.scss']
})
export class ViewCollectionComponent implements OnInit {
  collection: CardCollection;
  editingSection: string;
  newSectionName: string;

  constructor(private ygoService: YugiohService) { }

  ngOnInit() {
    this.refresh();
  }

  addCard(card: Card) {
    card.cardCollection = this.getCopyOfCollection();

    this.ygoService.addCardToCollection(card).subscribe(data => {
      this.ygoService.setCurrentCollection(data);
      this.refresh();
    });
  }

  removeCard(card: Card) {
    card.cardCollection = this.getCopyOfCollection();

    this.ygoService.removeCardFromCollection(card).subscribe(data => {
      this.ygoService.setCurrentCollection(data);
      this.refresh();
    });
  }

  getCopyOfCollection() {
    const collection = new CardCollection();
    collection.id = this.collection.id;
    collection.name = this.collection.name;
    collection.userId = this.collection.userId;
    return collection;
  }

  refresh() {
    this.collection = this.ygoService.getCurrentCollection();
  }

  back() {
    this.ygoService.setCurrentCollection(null);
  }

  addSectionToCollection() {
    this.collection.sections.push(this.newSectionName);
    this.editingSection = this.newSectionName;
    this.newSectionName = null;
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

  getCardList(section: string, subSection?: CardTypeEnum): { ygoCard: YugiohCard, setCard: Card }[] {
    return this.collection.cards
      .sort((c1, c2) => c2.card_Prices[0].tcgplayer_Price - c1.card_Prices[0].tcgplayer_Price)
      .map(c => {
        return { ygoCard: c, setCard: this.getSetCard(c.id, section) }
      })
      .filter(c => c.setCard && (subSection !== null ? YugiohUtilities.getCardType(c.ygoCard) === subSection : true));
  }

  getSetCard(id: number, section: string): Card {
    return this.collection.cardIds.find(c => c.id === id && (section ? c.section === section : true));
  }

  getSectionPrice(section: string): number {
    return this.collection.cards
      .map(c => {
        return { ygoCard: c, setCard: this.getSetCard(c.id, section) }
      })
      .filter(c => c.setCard)
      .reduce((sum, c) => this.round(sum + this.getCardPrice(c)), 0);
  }

  getCardPrice(c: { ygoCard: YugiohCard, setCard: Card }): number {
    const setPrice = +c.ygoCard.card_Sets.find(s => s.set_Code === c.setCard.setCode).set_Price;
    return this.round(setPrice * c.setCard.quantity);
  }

  startEditing(section: string) {
    this.editingSection = this.editingSection === section ? null : section;
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

  getCardLink(card: YugiohCard) {
    return "/yugioh/" + card.id;
  }
}
