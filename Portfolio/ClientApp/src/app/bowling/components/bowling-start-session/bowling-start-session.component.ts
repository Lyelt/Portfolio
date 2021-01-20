import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BowlingService } from '../../services/bowling.service';
import { BowlingSession } from '../../models/bowling-session';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-bowling-start-session',
  templateUrl: './bowling-start-session.component.html',
  styleUrls: ['./bowling-start-session.component.scss']
})
export class BowlingStartSessionComponent implements OnInit {
  sessions: BowlingSession[] = [];

  selectedSession: BowlingSession;
  selectedSessionUser: string;
  selectedDate: Date;

  sessionForm: FormGroup;
  selectedTabIndex = 0;

  constructor(private ref: ChangeDetectorRef,
    private bowlingService: BowlingService,
    private dialogRef: MatDialogRef<BowlingStartSessionComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any) {

    this.sessionForm = this.formBuilder.group({
      existingSession: [''],
      newSession: ['']
    }, { validator: this.validateHasExactlyOne });
  }

  ngOnInit() {
    this.bowlingService.getSessions().subscribe(data => {
      this.sessions = data;
      this.sessions.sort((s1, s2) => new Date(s2.date).getTime() - new Date(s1.date).getTime());

      if (this.data && this.data.name && this.data.series) {
        const date = new Date(this.data.name);
        this.selectedSession = this.sessions.find(s => new Date(s.date).getTime() == this.data.name.getTime());
        this.selectedSessionUser = this.data.series;
        this.selectedDate = date;
        this.changeTab(1);
        this.ref.detectChanges();
      }
    });
  }

  validateHasExactlyOne(formGroup: FormGroup): any {
    const existingSession = formGroup.controls['existingSession'].value?.date;
    const newSession = formGroup.controls['newSession'].value?.date;
    // This form is only valid if exactly ONE of these fields is filled out
    const valid = (existingSession || newSession) && !(existingSession && newSession);
    return valid ? null : { missingNewOrExisting: true };
  }

  startAddingGames() {
    if (!this.selectedSession) {
      const newSession = new BowlingSession();
      newSession.date = this.selectedDate.toDateString();

      this.bowlingService.startNewSession(newSession).subscribe(data => {
        this.selectedSession = data;
        this.sessions.push(data);
        this.changeTab(1);
      });
    }
    else {
      this.changeTab(1);
    }
  }

  changeTab(index: number) {
    const oldIndex = index;
    this.selectedTabIndex = index;
    if (this.selectedTabIndex === 1 && oldIndex !== index) {
      this.startAddingGames();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
