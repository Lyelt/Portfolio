import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Dog, DogTime } from './models/dog';
import { DogService } from './services/dog.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-dog',
  templateUrl: './dog.component.html',
  styleUrls: ['./dog.component.scss']
})
export class DogComponent implements OnInit, OnDestroy {
  time: Date = new Date();
  lastUpdatedTime: Date = new Date();
  canMakeChanges: boolean;
  dogTimes: DogTime[] = [];

  connected: boolean = false;
  nudgeAcknowledged: boolean = false;
  showingOldTimes: boolean = false;
  awaitingAlert: boolean = false;
  nudgeSent: boolean = false;
  currentlyBeingNudged: boolean = false;

  outsideDog: Dog;

  myDog: Dog = Dog.Nobody;
  otherDog: Dog = Dog.Nobody;
  nobody: Dog = Dog.Nobody;

  allClearAudio: HTMLAudioElement;
  nudgeAudio: HTMLAudioElement;
  private clockIntervalId: ReturnType<typeof setInterval>;
  private readonly destroyed$ = new Subject<void>();

  constructor(private dogService: DogService, private cd: ChangeDetectorRef, private authService: AuthService) { }

  ngOnInit(): void {
    this.clockIntervalId = setInterval(() => {
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

    this.refreshDogTimes();
    
    this.dogService.outsideDog().pipe(takeUntil(this.destroyed$)).subscribe(d => {
      if (this.awaitingAlert && this.outsideDog === this.otherDog && d !== this.otherDog) {
        if (!this.allClearAudio) {
          this.allClearAudio = new Audio('../assets/audio/all-clear.wav');
          this.allClearAudio.loop = true;
          this.allClearAudio.muted = false;
          this.allClearAudio.play();
        }
      }
      else if (this.awaitingAlert && (d === this.myDog)) {
        this.silence();
      }
      
      this.refreshDogTimes();

      this.currentlyBeingNudged = false;
      this.nudgeAcknowledged = false;
      this.outsideDog = d;
      this.cd.detectChanges();
    });

    this.dogService.onNudge().pipe(takeUntil(this.destroyed$)).subscribe(nudgedDog => {
      if (this.outsideDog === this.myDog && nudgedDog === this.myDog) {
        if (!this.nudgeAudio) {
          this.nudgeAudio = new Audio('../assets/audio/nudge.wav');
          this.nudgeAudio.loop = true;
          this.nudgeAudio.muted = false;
          this.nudgeAudio.play();
        }
        this.currentlyBeingNudged = true;
      }
    });

    this.dogService.onNudgeAcknowledged().pipe(takeUntil(this.destroyed$)).subscribe(nudgedDog => {
      if (nudgedDog === this.otherDog) {
        this.nudgeAcknowledged = true;
      }
    });
    
    this.dogService.onConnectionStatusChange().pipe(takeUntil(this.destroyed$)).subscribe(connected => {
      this.connected = connected;
    });

    this.dogService.start();
  }

  ngOnDestroy(): void {
    clearInterval(this.clockIntervalId);
    this.destroyed$.next();
    this.destroyed$.complete();
    this.silence();
    this.dogService.stop();
  }

  refresh() {
    window.location.reload();
  }

  toggleDog(dog: Dog) {
    if (this.canMakeChanges && this.outsideDog !== dog) {
      this.dogService.toggleOutsideDog(dog);
    }
  }

  silence() {
    this.awaitingAlert = false;
    if (this.allClearAudio) {
      this.allClearAudio.pause();
      this.allClearAudio.currentTime = 0;
      this.allClearAudio = null;
    }
    if (this.nudgeAudio) {
      this.nudgeAudio.pause();
      this.nudgeAudio.currentTime = 0;
      this.nudgeAudio = null;
    }
  }

  getDogName(dog: Dog): string {
    return Dog[dog];
  }

  refreshDogTimes() {
    this.dogService.getRecentDogTimes(10).subscribe(times => {
      this.dogTimes = times || [];
      if (this.dogTimes.length > 0) {
        this.lastUpdatedTime = new Date(this.dogTimes[0].timestamp + 'Z');
      }
    });
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

  acknowledgeNudge() {
    this.silence();
    this.dogService.acknowledgeNudge(this.myDog);
    this.nudgeAcknowledged = true;
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

  showingWarningBox() {
    return (this.awaitingAlert && this.outsideDog === this.otherDog) || this.currentlyBeingNudged
  }

  showingAlertMeBox() {
    return !this.awaitingAlert && this.outsideDog === this.otherDog;
  }
}
