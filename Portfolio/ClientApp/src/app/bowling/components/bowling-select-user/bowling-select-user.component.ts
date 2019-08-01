import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { BowlingService } from '../../services/bowling.service';
import { User } from '../../../auth/user';

@Component({
  selector: 'app-bowling-select-user',
  templateUrl: './bowling-select-user.component.html',
  styleUrls: ['./bowling-select-user.component.scss']
})
export class BowlingSelectUserComponent implements OnInit {
  @Input() label: string;
  @Input() initialUserId: string;

  bowlers: User[] = [];
  currentUserId: string = this.initialUserId;

  @Output() selectionChange = new EventEmitter();

  constructor(private bowlingService: BowlingService) { }

  ngOnInit() {
    this.bowlingService.getBowlers().subscribe(data => {
      this.bowlers = data;
    },
    (err) => {
      console.error(err);
      alert(err.message);
    });
  }

  selectUser() {
    this.selectionChange.emit(this.currentUserId);
  }
}