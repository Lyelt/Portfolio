import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { YugiohService } from "../../services/yugioh.service";
import {
  YugiohCardFilter,
  YugiohCard,
  YugiohUtilities,
  SearchResults,
  CardTypeEnum,
  CardSet,
} from "../../models/yugioh.model";
import { Card, CardCollection } from "../../models/card-collections";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-search-results",
  templateUrl: "./search-results.component.html",
  styleUrls: ["./search-results.component.scss"],
})
export class SearchResultsComponent implements OnInit, OnChanges {
  @Input() searchFilter: YugiohCardFilter;

  searchParam: string;
  searchResults: SearchResults;

  pageNumber: number = 1;
  entriesPerPage: number = 20;

  collections: CardCollection[];

  hoveredCard?: YugiohCard;
  hoveredIndex?: number;

  constructor(private ygoService: YugiohService, private authService: AuthService) {}

  ngOnInit() {
    this.getSearchResults();
    this.ygoService.getCollectionsForUser(this.authService.getLoggedInUserId()).subscribe(c => {
        this.collections = c;
    });
  }

  ngOnChanges() {
    this.getSearchResults();
  }

  hoveringCard(card: YugiohCard, index: number) {
    this.hoveredCard = card;
    this.hoveredIndex = index;
  }

  stopHovering() {
    this.hoveredCard = null;
    this.hoveredIndex = null;
  }

  getSearchResults() {
    this.searchParam = this.searchFilter.filters.find(f => f.name == "name").value;
    this.ygoService.getCardsWithFilter(this.searchFilter).subscribe((data) => {
      this.searchResults = data;
    });
  }

  getCardLink(card: YugiohCard) {
    return YugiohUtilities.getCardLink(card);
  }

  goToCard(card: YugiohCard) {
    window.location.href = this.getCardLink(card);
  }

  addCardToCollection(card: YugiohCard, set: CardSet, collection: CardCollection, section: string) {
      let addedCard: Card = {id: card.id, setCode: set.set_Code, cardCollection: collection, section: section, quantity: 1};
      this.ygoService.addCardToCollection(addedCard).subscribe(newCollection => {

      });
      console.log("added: ", card, set, collection);
  }

  previous() {
    if (this.pageNumber > 1) {
        this.setPage(this.pageNumber - 1);
    }
  }

  next() {
    if (this.searchResults?.results?.length === this.entriesPerPage) {
        this.setPage(this.pageNumber + 1);
    }  
  }

  setPage(pageNumber: number) {
    this.pageNumber = pageNumber;
    this.searchFilter.pageNumber = this.pageNumber;
    this.getSearchResults();
  }

  get start() {
    return (this.pageNumber - 1) * this.entriesPerPage + 1;
  }

  get end() {
    const end = this.pageNumber * this.entriesPerPage;
    return this.entriesPerPage < 0 ? null : end > this.searchResults?.totalResults ? this.searchResults?.totalResults : end;
  }

  getAtkDefDisplay(card: YugiohCard) {
    return YugiohUtilities.getAtkDefDisplay(card);
  }

  getLevelLabel(card: YugiohCard) {
    return YugiohUtilities.getLevelLabel(card);
  }

  getLevelDisplay(card: YugiohCard) {
    return YugiohUtilities.getLevelDisplay(card);
  }

  getCardType(card: YugiohCard) {
      return YugiohUtilities.getCardType(card);
  }

  get CardTypeEnum() {
      return CardTypeEnum;
  }
}
