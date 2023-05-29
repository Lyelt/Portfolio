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
  awaitingAlert: boolean = false;
  nudgeSent: boolean = false;

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
      if (this.awaitingAlert && this.outsideDog === this.otherDog && d !== this.otherDog) {
        console.log("playing sound to indicate that " + this.otherDog + " is no longer outside");
        var audio = new Audio('../assets/audio/all-clear.wav');
        audio.play();
      }
      this.outsideDog = d;
      this.cd.detectChanges();
    });

    this.dogService.onNudge().subscribe(nudgedDog => {
      if (this.outsideDog === this.myDog && nudgedDog === this.myDog) {
        console.log("playing sound to indicate that " + nudgedDog + " should come inside");
        var audio = new Audio('../assets/audio/nudge.wav');
        audio.play();
      }
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

  nudge() {
    if (this.canMakeChanges) {
      this.nudgeSent = true;
      this.dogService.nudge(this.otherDog);
    }
  }

  cancelAlert() {
    this.awaitingAlert = false;
    this.nudgeSent = false;
  }
}
