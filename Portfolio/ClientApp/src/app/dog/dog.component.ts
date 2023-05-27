import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Dog } from './models/dog';
import { DogService } from './services/dog.service';

@Component({
  selector: 'app-dog',
  templateUrl: './dog.component.html',
  styleUrls: ['./dog.component.scss']
})
export class DogComponent implements OnInit {
  canMakeChanges: boolean;
  outsideDog: Dog;

  myDog: Dog = Dog.Nobody;
  otherDog: Dog = Dog.Nobody;
  nobody: Dog = Dog.Nobody;

  constructor(private dogService: DogService, private cd: ChangeDetectorRef, private authService: AuthService) { }

  ngOnInit(): void {
    const dogs = JSON.parse(localStorage.getItem("dogs"));
    if (dogs !== null) {
      this.myDog = dogs.myDog;
      this.otherDog = dogs.otherDog;
    }

    this.dogService.getDogOwners().subscribe(owners => {
      this.canMakeChanges = owners.map(o => o.id).filter(o => o === this.authService.getLoggedInUserId()).length > 0;
    });
    
    this.dogService.outsideDog().subscribe(d => {
      this.outsideDog = d;
      this.cd.detectChanges();
    });

    this.dogService.start();
  }

  toggleDog(dog: Dog) {
    if (this.canMakeChanges) {
      this.dogService.toggleOutsideDog(dog);
    }
  }

  getDogName(dog: Dog): string {
    return Dog[dog];
  }

  claimPenny() { 
    this.setDogs(Dog.Penny, Dog.Calvin);
  }

  claimCalvin() {
    this.setDogs(Dog.Calvin, Dog.Penny);
  }

  setDogs(myDog: Dog, otherDog: Dog) {
    this.myDog = myDog;
    this.otherDog = otherDog;
    localStorage.setItem("dogs", JSON.stringify({ myDog: myDog, otherDog: otherDog }));
  }
}
