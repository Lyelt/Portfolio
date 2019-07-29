import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatStepper } from '@angular/material';
import { BowlingService } from '../../services/bowling.service';
import { BowlingSession } from '../../models/bowling-session';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  sessionForm: FormGroup;

  constructor(private bowlingService: BowlingService,
    private dialogRef: MatDialogRef<BowlingAddComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data) {

    this.sessions = data.sessions;
    this.currentUserId = data.currentUserId;
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

  onStepChange(event: any, stepper: MatStepper) {
    if (event.selectedIndex == 0 && stepper.selectedIndex != 0) {
      stepper.reset();
    }
    else if (event.selectedIndex != 1) {
      this.startAddingGames(stepper);
    }
  }

  startAddingGames(stepper: MatStepper) {
    if (!this.selectedSession) {
      let newSession = new BowlingSession();
      newSession.date = this.selectedDate.toDateString();

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
