import { Component, OnInit, OnChanges, Output, EventEmitter, Input } from '@angular/core';
import { SeriesCategory } from '../../models/series-category';

@Component({
  selector: 'app-bowling-select-series-category',
  templateUrl: './bowling-select-series-category.component.html',
  styleUrls: ['./bowling-select-series-category.component.scss']
})
export class BowlingSelectSeriesCategoryComponent implements OnInit {
  @Input() label: string;
  @Input() seriesCategories: SeriesCategory[];
  @Input() initialSeriesCategory: SeriesCategory;

  currentSeriesCategory: SeriesCategory;

  @Output() selectionChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.currentSeriesCategory = this.initialSeriesCategory;
  }

  ngOnChanges() {
    this.currentSeriesCategory = this.initialSeriesCategory;
  }

  selectSeriesCategory() {
    this.selectionChange.emit(this.currentSeriesCategory);
  }
}
