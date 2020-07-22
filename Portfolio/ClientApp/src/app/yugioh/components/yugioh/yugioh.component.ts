import { Component, OnInit, ViewChild } from '@angular/core';
import { YugiohService } from '../../services/yugioh.service';
import { YugiohCard } from '../../models/yugioh.model';
import { Card, CardCollection } from '../../models/card-collections';

@Component({
    selector: 'app-yugioh',
    templateUrl: './yugioh.component.html',
    styleUrls: ['./yugioh.component.scss']
})
export class YugiohComponent implements OnInit {
    currentUserId: string;
    selectedSection: string;
    searchParam: string;

    selectedCard: YugiohCard;
    selectedCollection: CardCollection;

    selectedTabIndex: number = 0;

    constructor(private yugiohService: YugiohService) { }
    
    ngOnInit() {
        this.currentUserId = localStorage.getItem("userId");
    }

    selectUser(user) {

    }

    openedCollection() {
        return this.yugiohService.getCurrentCollection();
    }

    cardSelected(card) {
        this.searchParam = null;
        this.selectedCard = card;
    }

    searchCleared() {
        this.selectedCard = null;
        this.searchParam = null;
    }

    cardSearched(searchParam: string) {
        this.selectedCard = null;
        this.searchParam = searchParam;
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
