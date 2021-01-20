import { Component, OnInit, Inject } from '@angular/core';
import { SpeedrunComponent } from '../speedrun/speedrun.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { StarTime } from '../../models/star-time';

@Component({
  selector: 'app-edit-star',
  templateUrl: './edit-star.component.html',
  styleUrls: ['./edit-star.component.scss']
})
export class EditStarComponent implements OnInit {
  form: FormGroup;
  starTime: StarTime;
  starName: string;

  constructor(private sanitizer: DomSanitizer,
              private fb: FormBuilder,
              private dialogRef: MatDialogRef<SpeedrunComponent>,
              @Inject(MAT_DIALOG_DATA) data) {
    this.starTime = data.starTime;
    this.starName = data.starName;
  }

  ngOnInit() {
    this.form = this.fb.group({
      starId: [this.starTime.starId],
      userId: [this.starTime.userId],
      time: [this.starTime.timeDisplay, [Validators.pattern("[0-9][0-9]:[0-5][0-9]:[0-5][0-9][.][0-9][0-9]")]],
      videoUrl: [this.starTime.videoUrl]
    });
  }

  save() {
    this.dialogRef.close({ starTime: this.form.value });
  }

  close() {
    this.dialogRef.close();
  }

  getYoutubeUrl(watchCode: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + watchCode);
  }

}
