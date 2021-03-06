import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthService) { }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value).subscribe(data => {
            this.router.navigate([this.returnUrl]);
        },
        error => {
            this.loading = false;
        },
        () => {            
            this.loading = false;
        });
    }

    guestLogin() {
        //this.loading = true;
        this.authenticationService.guestLogin().subscribe(data => {
            this.router.navigate([this.returnUrl]);
        }),
        error => {
            this.loading = false;
        },
        () => {            
            this.loading = false;
        };
    }

    navigatingToSpeedrun(): boolean {
        return this.returnUrl.indexOf('speedrun') >= 0;
    }
}


