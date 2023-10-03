import { Component, OnInit } from '@angular/core';
import { GameNightService } from '../../services/game-night.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameNight, GameNightMeal } from '../../models/game-night';

@Component({
  selector: 'app-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss']
})
export class MealsComponent implements OnInit {
  public meals: GameNightMeal[] = [];
  public form: FormGroup;
  public addedMeal: GameNightMeal = new GameNightMeal();
  public addingMeal: boolean = false;

  constructor(private gnService: GameNightService, private fb: FormBuilder) {
    this.gnService.meals().subscribe(data => {
      this.meals = data;
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm() {
    this.form = this.fb.group({
      name: [this.addedMeal.name, Validators.required]
    });
  }

  public setMeal(meal: GameNightMeal) {
    if (this.userCanSetMeal()) {
      const gn = this.getSelectedGameNight();
      gn.meal = meal;
      gn.gameNightMealId = meal.id;
      this.gnService.saveMeal(gn);
    }
    else {
      //this.gnService.suggestMeal(meal);
    }
  }

  public userCanSetMeal(): boolean {
    return this.gnService.userCanSetMeal();
  }

  public getSelectedGameNight(): GameNight {
    return this.gnService.selectedGameNight;
  }

  public addMeal() {
    this.gnService.addMeal(this.form.value);
    this.form.reset();
  }
}
