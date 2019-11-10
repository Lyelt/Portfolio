import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BowlingService } from '../../services/bowling.service';
import { BowlingSession } from '../../models/bowling-session';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BowlingAddGameComponent } from '../bowling-add-game/bowling-add-game.component';

@Component({
    selector: 'app-bowling-start-session',
    templateUrl: './bowling-start-session.component.html',
    styleUrls: ['./bowling-start-session.component.scss']
})
export class BowlingStartSessionComponent implements OnInit {
    @ViewChild('addGames') public addGames: BowlingAddGameComponent;

    sessions: BowlingSession[] = [];

    selectedSession: BowlingSession;
    selectedDate: Date;

    sessionForm: FormGroup;
    selectedTabIndex: number = 0;

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
                let date = new Date(this.data.name);
                this.selectedSession = this.sessions.find(s => new Date(s.date).getTime() == this.data.name.getTime());
                this.selectedDate = date;
                this.changeTab(1);
                this.ref.detectChanges();
                this.addGames.selectUserByName(this.data.series);
            }
        },
        (err) => {
            console.error(err);
            alert(err.message);
        });
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
