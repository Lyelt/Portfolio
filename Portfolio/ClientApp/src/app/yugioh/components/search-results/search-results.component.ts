import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { YugiohService } from '../../services/yugioh.service';
import { YugiohCardFilter, YugiohCard, YugiohUtilities } from '../../models/yugioh.model';

@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnChanges {
    @Input() searchFilter: YugiohCardFilter;

    searchParam: string;
    searchResults: YugiohCard[];

    constructor(private ygoService: YugiohService) { }

    ngOnInit() {
        this.getSearchResults();
    }

    ngOnChanges() {
        this.getSearchResults();
    }

    getSearchResults() {
        this.searchParam = this.searchFilter.filters.find(f => f.name == "name").value;
        this.ygoService.getCardsWithFilter(this.searchFilter).subscribe(data => {
            this.searchResults = data;
        });
    }

    getCardLink(card: YugiohCard) {
        return YugiohUtilities.getCardLink(card);
    }
}
