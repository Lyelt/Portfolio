import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Dog, DogTime } from './models/dog';
import { DogService } from './services/dog.service';

@Component({
  selector: 'app-dog',
  templateUrl: './dog.component.html',
  styleUrls: ['./dog.component.scss']
})
export class DogComponent implements OnInit {
  time: Date = new Date();
  lastUpdatedTime: Date = new Date();
  canMakeChanges: boolean;
  dogTimes: DogTime[] = [];

  awaitingAlert: boolean = false;
  nudgeSent: boolean = false;
  currentlyBeingNudged: boolean = false;

  outsideDog: Dog;

  myDog: Dog = Dog.Nobody;
  otherDog: Dog = Dog.Nobody;
  nobody: Dog = Dog.Nobody;

  constructor(private dogService: DogService, private cd: ChangeDetectorRef, private authService: AuthService) { }

  ngOnInit(): void {
    setInterval(() => {
      this.time = new Date();
    }, 1000);

    const dogs = JSON.parse(localStorage.getItem("dogs"));
    if (dogs !== null) {
      this.myDog = dogs.myDog;
      this.otherDog = dogs.otherDog;
    }

    this.dogService.getDogOwners().subscribe(owners => {
      this.canMakeChanges = owners.map(o => o.id).filter(o => o === this.authService.getLoggedInUserId()).length > 0;
    });

    this.dogService.getRecentDogTimes(10).subscribe(times => {
      this.dogTimes = times;
    });
    
    this.dogService.outsideDog().subscribe(d => {
      if (this.awaitingAlert && this.outsideDog === this.otherDog && d !== this.otherDog) {
        console.log("playing sound to indicate that " + this.otherDog + " is no longer outside");
        var audio = new Audio('../assets/audio/all-clear.wav');
        audio.play();
        this.awaitingAlert = false;
      }

      this.currentlyBeingNudged = false;
      this.lastUpdatedTime = new Date();
      this.outsideDog = d;
      this.cd.detectChanges();
    });

    this.dogService.onNudge().subscribe(nudgedDog => {
      if (this.outsideDog === this.myDog && nudgedDog === this.myDog) {
        console.log("playing sound to indicate that " + nudgedDog + " should come inside");
        var audio = new Audio('../assets/audio/nudge.wav');
        audio.play();
        this.currentlyBeingNudged = true;
      }
    });

    this.dogService.start();
  }

  toggleDog(dog: Dog) {
    if (this.canMakeChanges && this.outsideDog !== dog) {
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

  getDurationDisplay(): string {
    return this.timeSince(this.lastUpdatedTime);
  }

  timeSince(date: Date): string {
    var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    var intervalType;
  
    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      intervalType = 'year';
    } else {
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) {
        intervalType = 'month';
      } else {
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
          intervalType = 'day';
        } else {
          interval = Math.floor(seconds / 3600);
          if (interval >= 1) {
            intervalType = "hour";
          } else {
            interval = Math.floor(seconds / 60);
            if (interval >= 1) {
              intervalType = "minute";
            } else {
              return "just now";
            }
          }
        }
      }
    }
  
    if (interval > 1 || interval === 0) {
      intervalType += 's';
    }
  
    return interval + " " + intervalType + " ago";
  }
}
