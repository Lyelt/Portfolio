import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { YugiohService } from "../../services/yugioh.service";
import {
  YugiohCardFilter,
  YugiohCard,
  YugiohUtilities,
  SearchResults,
  CardTypeEnum,
} from "../../models/yugioh.model";

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

  constructor(private ygoService: YugiohService) {}

  ngOnInit() {
    this.getSearchResults();
  }

  ngOnChanges() {
    this.getSearchResults();
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
