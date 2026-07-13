import { Component, OnInit } from '@angular/core';
import { YugiohService } from '../../services/yugioh.service';
import { YugiohCard, YugiohCardFilter, YugiohUtilities } from '../../models/yugioh.model';
import { CardCollection } from '../../models/card-collections';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  standalone: false,
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

    constructor(private yugiohService: YugiohService, private auth: AuthService, private route: ActivatedRoute, private router: Router) { }
    
    ngOnInit() {
        this.currentUserId = this.auth.getLoggedInUserId();
        this.route.params.subscribe(params => {
            const route = this.route.routeConfig.path.split('/')[1];

            if (route === 'card') {
                const id = +params['cardId'];
                this.yugiohService.getCardById(id).subscribe(data => {
                    this.selectedCard = data;
                });
            }
            else if (route === 'search') {
                this.route.queryParams.subscribe(p => {
                    this.searchFilter = YugiohUtilities.getFilter(p.name);
                    this.searchSubmitted(this.searchFilter);
                });
            }
        });
    }

    openedCollection() {
        return this.yugiohService.getCurrentCollection();
    }

    showSearchResults() {
        this.selectedCard = null; 
    }

    cardSelected(card) {
        this.router.navigate(['/yugioh/card', card.id]);
    }

    searchCleared() {
        this.selectedCard = null;
        this.searchFilter = null;
        this.router.navigate(['/yugioh']);
    }

    cardSearched(filter: YugiohCardFilter) {
        this.selectedCard = null;
        this.searchFilter = filter;
    }

    searchSubmitted(filter: YugiohCardFilter) {
        this.selectedCard = null;
        this.searchFilter = filter;
        const name = filter.filters.find(f => f.name === 'name')?.value;
        this.router.navigate(['/yugioh/search'], { queryParams: { name } });
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
