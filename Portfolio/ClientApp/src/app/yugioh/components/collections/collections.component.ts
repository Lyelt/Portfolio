import { Component, OnInit, Input } from '@angular/core';
import { YugiohService } from '../../services/yugioh.service';
import { CardCollection } from '../../models/card-collections';

@Component({
    selector: 'app-collections',
    templateUrl: './collections.component.html',
    styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

    @Input() userId?: string;
    collections: CardCollection[] = [];
    selectedCollection: CardCollection;

    constructor(private yugiohService: YugiohService) { }

    ngOnInit() {
        if (!this.userId) {
            this.userId = localStorage.getItem('userId');
        }

        this.resetSelection();
        this.refreshCollections();
    }

    deleteCollection(collection: CardCollection) {
        this.yugiohService.deleteCollection(collection).subscribe(data => {
            this.resetSelection();
            this.refreshCollections();
        },
        error => {
            console.log(error);
            alert(error);
        });
    }

    updateCollection() {
        this.yugiohService.updateCollection(this.selectedCollection).subscribe(data => {
            this.resetSelection();
            this.refreshCollections();
        },
        error => {
            console.log(error);
            alert(error);
        });
    }

    refreshCollections() {
        this.yugiohService.getCollectionsForUser(this.userId).subscribe(data => {
            this.collections = data;
        },
        error => {
            console.log(error);
            alert(error);
        });
    }

    resetSelection() {
        this.selectedCollection = { id: 0, name: "", cardIds: [], cards: [], userId: this.userId }
    }
}
