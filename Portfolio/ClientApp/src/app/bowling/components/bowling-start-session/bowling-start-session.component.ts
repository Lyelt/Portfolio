import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatStepper } from '@angular/material';
import { BowlingService } from '../../services/bowling.service';
import { BowlingSession } from '../../models/bowling-session';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../auth/user';
import { BowlingGame } from '../../models/bowling-game';

@Component({
  selector: 'app-bowling-start-session',
  templateUrl: './bowling-start-session.component.html',
  styleUrls: ['./bowling-start-session.component.scss']
})
export class BowlingStartSessionComponent implements OnInit {
  sessions: BowlingSession[] = [];

  selectedSession: BowlingSession;
  selectedDate: Date;

  sessionForm: FormGroup;
  selectedTabIndex: number = 0;

  constructor(private bowlingService: BowlingService,
    private dialogRef: MatDialogRef<BowlingStartSessionComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data) {

    this.sessions = data.sessions;
    this.sessionForm = this.formBuilder.group({
      existingSession: [''],
      newSession: ['']
    }, { validator: this.validateHasExactlyOne });
  }

  ngOnInit() {
    this.sessions.sort((s1, s2) => new Date(s2.date).getTime() - new Date(s1.date).getTime());
  }

  validateHasExactlyOne(formGroup: FormGroup): any {
    let existingSession = formGroup.controls['existingSession'].value;
    let newSession = formGroup.controls['newSession'].value;
    // This form is only valid if exactly ONE of these fields is filled out
    let valid = (existingSession || newSession) && !(existingSession && newSession);
    return valid ? null : { missingNewOrExisting: true };
  }

  onTabChange(event: any) {
    this.selectedTabIndex = event.index;

    if (event.index == 1) {
      this.startAddingGames();
    }
  }

  startAddingGames() {
    if (!this.selectedSession) {
      let newSession = new BowlingSession();
      newSession.date = this.selectedDate.toDateString();

      this.bowlingService.startNewSession(newSession).subscribe(data => {
        this.selectedSession = data;
        this.sessions.push(data);
        this.changeTab(1);
      },
        (err) => {
          console.error(err);
          alert(err.message);
        });
    }
    else {
      this.changeTab(1);
    }
  }

  changeTab(index: number) {
    this.selectedTabIndex = index;
  }

  close() {
    this.dialogRef.close();
  }

}
