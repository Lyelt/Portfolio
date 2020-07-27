import { Component, OnInit, ViewChild } from '@angular/core';
import { YugiohService } from '../../services/yugioh.service';
import { YugiohCard, YugiohCardFilter } from '../../models/yugioh.model';
import { Card, CardCollection } from '../../models/card-collections';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-yugioh',
    templateUrl: './yugioh.component.html',
    styleUrls: ['./yugioh.component.scss']
})
export class YugiohComponent implements OnInit {
    currentUserId: string;
    selectedSection: string;
    searchFilter: YugiohCardFilter;

    selectedCard: YugiohCard;
    selectedCollection: CardCollection;

    selectedTabIndex: number = 0;

    constructor(private yugiohService: YugiohService, private route: ActivatedRoute) { }
    
    ngOnInit() {
        this.currentUserId = localStorage.getItem("userId");
        this.route.params.subscribe(params => {
            const id = +params['cardId'];
            this.yugiohService.getCardById(id).subscribe(data => {
                this.selectedCard = data;
            });
        });
    }

    openedCollection() {
        return this.yugiohService.getCurrentCollection();
    }

    cardSelected(card) {
        this.searchFilter = null;
        this.selectedCard = card;
    }

    searchCleared() {
        this.selectedCard = null;
        this.searchFilter = null;
    }

    cardSearched(filter: YugiohCardFilter) {
        this.selectedCard = null;
        this.searchFilter = filter;
    }

    selectCollection(event: any) {
        this.selectedCollection = event.collection;
        this.selectedSection = event.section;
        this.selectedTabIndex = 0;
    }

    isLoggedIn() {
        return localStorage.getItem('jwt');
    }

    onTabChange(event: any) {
        this.selectedTabIndex = event.index;
    }
}
