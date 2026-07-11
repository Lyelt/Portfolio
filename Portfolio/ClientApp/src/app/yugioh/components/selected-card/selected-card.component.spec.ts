import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedCardComponent } from './selected-card.component';
import { YugiohCard } from '../../models/yugioh.model';

describe('SelectedCardComponent', () => {
  let component: SelectedCardComponent;
  let fixture: ComponentFixture<SelectedCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedCardComponent);
    component = fixture.componentInstance;
    component.card = {
      id: 1,
      name: 'Test card',
      type: 'Spell Card',
      desc: 'Test description',
      race: 'Normal',
      attribute: null,
      card_Sets: [],
      card_Images: [{ id: '1', image_Url: '', image_Url_Small: '' }],
      card_Prices: [{ tcgplayer_Price: 1 }]
    } as YugiohCard;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
