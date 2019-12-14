import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { YugiohCard } from '../models/yugioh.model';

@Injectable({
  providedIn: 'root'
})
export class YugiohService {

    private http: HttpClient;

    constructor(handler: HttpBackend) {
        this.http = new HttpClient(handler);
    }

    test() {
        this.http.get('Yugioh/GetCards/1/25').subscribe(data => {
            console.log(data);
        },
        (err) => {
            console.error(err);
            alert(err.message);
        });
    }

    getAllCards() {
        return this.http.get<YugiohCard[]>('Yugioh/GetCards/1/30000');
    }

    getCardsWithFilter(nameFilter: string) {
        return this.http.get<YugiohCard[]>('Yugioh/GetCards/1/30000/' + encodeURIComponent(nameFilter));
    }
}
