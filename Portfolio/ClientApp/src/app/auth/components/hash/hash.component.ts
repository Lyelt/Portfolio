import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'app-hash',
    templateUrl: './hash.component.html',
    styleUrls: ['./hash.component.scss']
})
export class HashComponent implements OnInit {

    input: string = "";
    @ViewChild('output') output: ElementRef;

    constructor(private authService: AuthService) { }

    ngOnInit() {
    }

    hash() {
        this.authService.getHashedPassword(this.input).subscribe(response => {
            this.output.nativeElement.value = response.hash;
        });
    }

    copyToClipboard() {
        this.output.nativeElement.select();
        document.execCommand("copy");
    }

}
