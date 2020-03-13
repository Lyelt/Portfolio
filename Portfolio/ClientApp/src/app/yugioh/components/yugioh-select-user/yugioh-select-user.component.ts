import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { YugiohService } from '../../services/yugioh.service';
import { User } from '../../../auth/user';

@Component({
  selector: 'app-yugioh-select-user',
  templateUrl: './yugioh-select-user.component.html',
  styleUrls: ['./yugioh-select-user.component.scss']
})
export class YugiohSelectUserComponent implements OnInit {
    @Input() label: string;
    @Input() initialUserId: string;

    duelists: User[] = [];
    currentUserId: string = this.initialUserId;

    @Output() selectionChange = new EventEmitter();

    constructor(private yugiohService: YugiohService) { }

    ngOnInit() {
        this.yugiohService.getDuelists().subscribe(data => {
            this.duelists = data;
            this.currentUserId = this.initialUserId;
        });
    }

    changeUser(userId: string) {
        this.currentUserId = userId;
    }

    selectUser() {
        this.selectionChange.emit(this.currentUserId);
    }

}
