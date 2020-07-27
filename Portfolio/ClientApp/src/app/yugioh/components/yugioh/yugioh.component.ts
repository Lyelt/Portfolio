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
        window.history.pushState(card, card.name, "/yugioh/" + card.id);
    }

    searchCleared() {
        this.selectedCard = null;
        this.searchFilter = null;
        window.history.pushState("No card selected", "Yu-Gi-Oh", "/yugioh");
    }

    cardSearched(filter: YugiohCardFilter) {
        this.selectedCard = null;
        this.searchFilter = filter;
        window.history.pushState("No card selected", "Yu-Gi-Oh", "/yugioh");
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
