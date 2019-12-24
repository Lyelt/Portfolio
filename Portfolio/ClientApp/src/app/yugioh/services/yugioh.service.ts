import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { YugiohCard } from '../models/yugioh.model';
import { User } from '../../auth/user';
import { CardCollection, Card } from '../models/card-collections';

@Injectable({
  providedIn: 'root'
})
export class YugiohService {

    constructor(private http: HttpClient) {
    }

    getAllCards() {
        return this.http.get<YugiohCard[]>('Yugioh/GetCards/1/30000');
    }

    getCardsWithFilter(nameFilter: string) {
        return this.http.get<YugiohCard[]>('Yugioh/GetCards/1/30000/' + encodeURIComponent(nameFilter));
    }

    getDuelists() {
        return this.http.get<User[]>('Yugioh/GetUsers');
    }

    getCollectionsForUser(userId: string) {
        return this.http.get<CardCollection[]>('Yugioh/GetCollections/' + userId);
    }

    updateCollection(collection: CardCollection) {
        return this.http.post<CardCollection>('Yugioh/UpdateCollection', collection);
    }

    addCardToCollection(card: Card) {
        return this.http.post<YugiohCard>('Yugioh/AddCardToCollection', card);
    }

    deleteCollection(collection: CardCollection) {
        return this.http.delete<YugiohCard>('Yugioh/DeleteCollection/' + collection.id);
    }
}
