import { Component, OnInit } from '@angular/core';
import { YugiohService } from '../../services/yugioh.service';
import { YugiohCard, YugiohCardFilter, YugiohUtilities } from '../../models/yugioh.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: false,
    selector: 'app-yugioh',
    templateUrl: './yugioh.component.html',
})
export class YugiohComponent implements OnInit {
    searchFilter: YugiohCardFilter;

    selectedCard: YugiohCard;

    constructor(private yugiohService: YugiohService, private route: ActivatedRoute, private router: Router) { }
    
    ngOnInit() {
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

}
