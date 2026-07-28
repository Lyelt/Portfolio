import { Component, OnInit } from '@angular/core';
import { YugiohService } from '../../services/yugioh.service';
import { CardCollection } from '../../models/card-collections';

@Component({
  standalone: false,
    selector: 'app-collections',
    templateUrl: './collections.component.html',
})
export class CollectionsComponent implements OnInit {

    userId: string;
    collections: CardCollection[] = [];
    editingCollection: CardCollection;
    addingCollection: boolean = false;

    loading: boolean = true;

    constructor(private yugiohService: YugiohService) { }

    ngOnInit() {
        this.userId = localStorage.getItem('userId');

        this.resetSelection();
        this.refreshCollections();
    }

    startEditing(collection: CardCollection) {
        this.editingCollection = collection;
        this.addingCollection = true;
    }

    openCollection(collection: CardCollection) {
        this.yugiohService.setCurrentCollection(collection);
    }

    deleteCollection(collection: CardCollection) {
        this.yugiohService.deleteCollection(collection).subscribe(() => {
            this.resetSelection();
            this.refreshCollections();
        });
    }

    duplicate(collection: CardCollection) {
        this.yugiohService.duplicate(collection).subscribe(() => {
            this.refreshCollections();
        });
    }

    updateCollection() {
        this.yugiohService.updateCollection(this.editingCollection).subscribe(() => {
            this.resetSelection();
            this.refreshCollections();
            this.addingCollection = false;
        });
    }

    refreshCollections() {
        this.yugiohService.getCollectionsForUser(this.userId).subscribe(data => {
            this.collections = data;
            if (!this.collections || this.collections.length == 0) {
                this.addingCollection = true;
            }

            this.loading = false;
        });
    }

    resetSelection() {
        this.editingCollection = { id: 0, name: "", cardIds: [], cards: [], userId: this.userId, sections: [] }
    }
}
