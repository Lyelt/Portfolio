import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StarTime } from '../../models/star-time';
import { FramesPipe } from '../../services/frames.pipe';
import { SpeedrunService } from '../../services/speedrun.service';

@Component({
  selector: 'app-edit-star',
  templateUrl: './edit-star.component.html',
  styleUrls: ['./edit-star.component.scss']
})
export class EditStarComponent implements OnInit, OnChanges {
  @Input() starTime: StarTime;
  @Input() runnerName: string;
  @Input() alignment: string = "left";
  form: FormGroup;
  frames: number;
  showFrames = false;

  constructor(private sr: SpeedrunService, private framePipe: FramesPipe, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.starTime.currentValue) {
      this.buildForm();
    }
  }

  save() {
    if (this.showFrames)
      this.starTime.time = null;

    this.starTime.time = this.starTime.time || "00:00:00.00"; // If not provided, use TimeSpan.Zero
    this.sr.updateStarTime(this.form.value);
  }

  buildForm() {
    this.frames = this.framePipe.transform(this.starTime.totalMilliseconds);

    this.form = this.fb.group({
      starId: [this.starTime.starId],
      userId: [this.starTime.userId],
      time: [this.starTime.timeDisplay, [Validators.pattern("[0-9][0-9]:[0-5][0-9]:[0-5][0-9][.][0-9][0-9]")]],
      videoUrl: [this.starTime.videoUrl],
      frames: [this.frames]
    });
  }
}
