import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StarTime } from '../../models/star-time';
import { SpeedrunService } from '../../services/speedrun.service';

@Component({
  selector: 'app-edit-star',
  templateUrl: './edit-star.component.html',
  styleUrls: ['./edit-star.component.scss']
})
export class EditStarComponent implements OnInit {
  @Input() starTime: StarTime;
  @Input() runnerName: string;
  @Input() alignment: string = "left";
  form: FormGroup;

  constructor(private sr: SpeedrunService, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.buildForm();
  }

  save() {
    this.form.value.time = (!this.form.value.time || this.form.value.time == "") ? "00:00:00.00" : this.form.value.time; // If not provided, use TimeSpan.Zero
    this.sr.updateStarTime(this.form.value);
  }

  buildForm() {
    this.form = this.fb.group({
      starId: [this.starTime.starId],
      userId: [this.starTime.userId],
      time: [this.starTime.timeDisplay, [Validators.pattern("[0-9][0-9]:[0-5][0-9]:[0-5][0-9][.][0-9][0-9]")]],
      videoUrl: [this.starTime.videoUrl]
    });
  }
}
