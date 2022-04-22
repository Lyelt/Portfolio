import { Component, OnInit } from '@angular/core';
import { CardCollection } from '../../models/card-collections';
import { YugiohCard } from '../../models/yugioh.model';
import { YugiohService } from '../../services/yugioh.service';

@Component({
  selector: 'app-small-world',
  templateUrl: './small-world.component.html',
  styleUrls: ['./small-world.component.scss']
})
export class SmallWorldComponent implements OnInit {

  collections: CardCollection[];
  userId: string;
  results: Result[];

  constructor(private yugiohService: YugiohService) { }

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId');

    this.yugiohService.getCollectionsForUser(this.userId).subscribe(data => {
      this.collections = data;
    });
  }

  evaluate(collection: CardCollection) {
    const key = 'id';
    let cards = [...new Map(collection.cards.map(card => [card[key], card])).values()];

    let monsters = cards.filter(c => this.isMainDeckMonster(c));
    if (monsters.length > 0) {
      this.results = [];
    }
    
    for (let m of monsters) {
      let targets = this.getSmallWorldTargets(m, monsters);
      //console.log("TARGETS!", targets);
      let result: Result = { originalMonster: m, targetResults: [], totalUniqueTargets: 0 };
      for (let t of targets) {
        let searches = this.getSmallWorldTargets(t.target, monsters);
        //console.log("SEARCHES!", searches);
        result.targetResults.push({ target: t, searches: searches.filter(s => s.target.id !== m.id) });
      }

      result.totalUniqueTargets = this.getTotalTargets(result);
      this.results.push(result);
    }

    this.results.sort((a, b) => b.totalUniqueTargets - a.totalUniqueTargets);
  }

  getSmallWorldTargets(m: YugiohCard, monsters: YugiohCard[]): Match[] {
    let matchResults = [];

    for (let target of monsters) {
      let results = this.smallWorldResults(m, target);
      if (results.length === 1) {
        console.log("Revealed monster: " + results[0].reveal.name + " has matching target " + results[0].target.name + " based on " + results[0].propertyName + " (" + results[0].target[results[0].propertyName] + ")");
        matchResults.push(results[0]);
      }
    }

    return matchResults;     
  }

  isMainDeckMonster(c: YugiohCard): boolean {
    return c.type.includes('Monster') && !c.type.includes("Fusion") && !c.type.includes("Link") && !c.type.includes("XYZ") && !c.type.includes("Synchro");
  }

  smallWorldResults(reveal: YugiohCard, target: YugiohCard): Match[] {
    const atk: Match = { isSame: reveal.atk == target.atk, propertyName: "atk", reveal: reveal, target: target };
    const def: Match = { isSame: reveal.def == target.def, propertyName: "def", reveal: reveal, target: target }; 
    const lvl: Match = { isSame: reveal.level == target.level, propertyName: "level", reveal: reveal, target: target };
    const attr: Match = { isSame: reveal.attribute == target.attribute, propertyName: "attribute", reveal: reveal, target: target };
    const type: Match = { isSame: reveal.race == target.race, propertyName: "race", reveal: reveal, target: target };

    if ((reveal.misc_Info.length > 0 && reveal.misc_Info[0].question_Atk) || (target.misc_Info.length > 0 && target.misc_Info[0].question_Atk))
      atk.isSame = false;
    if ((reveal.misc_Info.length > 0 && reveal.misc_Info[0].question_Def) || (target.misc_Info.length > 0 && target.misc_Info[0].question_Def))
      def.isSame = false;
      
    let similarities = [atk, def, lvl, attr, type];
    return similarities.filter(s => s.isSame);
  }

  getTotalTargets(result: Result): number {
    return [...new Set(result.targetResults.flatMap(tr => tr.searches).flatMap(s => s.target).map(c => c.id))].length;
  }
}

class Match {
  isSame: boolean;
  propertyName: string;
  reveal: YugiohCard;
  target: YugiohCard;
}

class Result {
  originalMonster: YugiohCard;
  targetResults: TargetResult[];
  totalUniqueTargets: number;
}

class TargetResult {
  target: Match;
  searches: Match[];
}
