import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { YugiohService } from '../../services/yugioh.service';
import { CardCollection } from '../../models/card-collections';

@Component({
    selector: 'app-collections',
    templateUrl: './collections.component.html',
    styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

    @Input() userId?: string;
    @Output() collectionOpened: EventEmitter<CardCollection> = new EventEmitter<CardCollection>();
    @Output() collectionSelected: EventEmitter<any> = new EventEmitter<any>();
    collections: CardCollection[] = [];
    editingCollection: CardCollection;
    addingCollection: boolean = false;

    addingSectionsTo: CardCollection;
    newSectionName: string;

    constructor(private yugiohService: YugiohService) { }

    ngOnInit() {
        if (!this.userId) {
            this.userId = localStorage.getItem('userId');
        }

        this.resetSelection();
        this.refreshCollections();
    }

    startEditing(collection: CardCollection) {
        this.editingCollection = collection;
        this.addingCollection = true;
    }

    openCollection(event: any, collection: CardCollection) {
        if (event.target.id == "menuSpan" || event.target.id == "menuIcon")
            return;

        this.yugiohService.setCurrentCollection(collection);
    }

    selectCollection(collection: CardCollection, section: string) {
        this.collectionSelected.emit({ collection: collection, section: section });
    }

    deleteCollection(collection: CardCollection) {
        this.yugiohService.deleteCollection(collection).subscribe(data => {
            this.resetSelection();
            this.refreshCollections();
        },
        error => {
            console.log(error);
            alert(error.error);
        });
    }

    updateCollection() {
        this.yugiohService.updateCollection(this.editingCollection).subscribe(data => {
            this.resetSelection();
            this.refreshCollections();
            this.addingCollection = false;
        },
        error => {
            console.log(error);
            alert(error.error);
        });
    }

    addSectionToCollection() {
        this.addingSectionsTo.sections.push(this.newSectionName);
        this.addingSectionsTo = null;
    }

    refreshCollections() {
        this.yugiohService.getCollectionsForUser(this.userId).subscribe(data => {
            this.collections = data;
            if (!this.collections || this.collections.length == 0) {
                this.addingCollection = true;
            }
        },
        error => {
            console.log(error);
        });
    }

    resetSelection() {
        this.editingCollection = { id: 0, name: "", cardIds: [], cards: [], userId: this.userId, sections: [] }
    }
}
