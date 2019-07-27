import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatStepper } from '@angular/material';
import { BowlingService } from '../../services/bowling.service';
import { BowlingSession } from '../../models/bowling-session';

@Component({
  selector: 'app-bowling-add',
  templateUrl: './bowling-add.component.html',
  styleUrls: ['./bowling-add.component.scss']
})
export class BowlingAddComponent implements OnInit {
  sessions: BowlingSession[] = [];
  currentUserId: string;

  selectedSession: BowlingSession;
  selectedDate: Date;

  constructor(private bowlingService: BowlingService,
    private dialogRef: MatDialogRef<BowlingAddComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    this.sessions = data.sessions;
    this.currentUserId = data.currentUserId;
  }

  ngOnInit() {
  }

  startAddingGames(stepper: MatStepper) {
    if (!this.selectedSession) {
      let newSession = new BowlingSession();
      newSession.date = this.selectedDate;

      this.bowlingService.startNewSession(newSession).subscribe(data => {
        this.selectedSession = data;
        stepper.next();
      },
      (err) => {
        console.error(err);
        alert(err.message);
      });
    }
    else {
      stepper.next();
    }
  }

  close() {
    this.dialogRef.close();
  }

}
