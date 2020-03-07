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

    selectedCard: YugiohCard;
    selectedCollection: CardCollection;
    //openedCollection: CardCollection;

    selectedTabIndex: number = 0;

    constructor(private yugiohService: YugiohService) { }
    
    ngOnInit() {
        this.currentUserId = localStorage.getItem("userId");
    }

    selectUser(user) {

    }

    cardSelected(card) {
        this.selectedCard = card;
    }

    searchCleared() {
        this.selectedCard = null;
    }

    openedCollection() {
        return this.yugiohService.getCurrentCollection();
    }

    //openCollection(collection: CardCollection) {
    //    this.yugiohService.setCurrentCollection(collection);
    //    //this.openedCollection = collection;
    //}

    //closeCollection() {
    //    this.yugiohService.setCurrentCollection(null);
    //    //this.openedCollection = null;
    //}

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
