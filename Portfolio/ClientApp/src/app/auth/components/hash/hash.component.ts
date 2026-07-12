import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  standalone: false,
    selector: 'app-hash',
    templateUrl: './hash.component.html',
    styleUrls: ['./hash.component.scss']
})
export class HashComponent implements OnInit {

    input: string = "";
    hashValue: string = "";
    copyStatus: string = "";

    constructor(private authService: AuthService) { }

    ngOnInit() {
    }

    hash() {
        this.authService.getHashedPassword(this.input).subscribe(response => {
            this.hashValue = response.hash;
            this.copyStatus = "";
        });
    }

    async copyToClipboard() {
        if (!this.hashValue) {
            return;
        }

        try {
            await navigator.clipboard.writeText(this.hashValue);
            this.copyStatus = "Copied";
        } catch {
            this.copyStatus = "Copy failed";
        }
    }

}
