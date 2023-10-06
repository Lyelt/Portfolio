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
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    getReturnUrl() {
        return this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    onSubmit() {
        this.submitted = true;

        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value).subscribe({
            next: () => { this.router.navigate([this.getReturnUrl()])},
            error: () => { this.loading = false; },
            complete: () => { this.loading = false; }
        });
    }

    guestLogin() {
        this.loading = true;
        this.authenticationService.guestLogin().subscribe({
            next: () => { this.router.navigate([this.getReturnUrl()])},
            error: () => { this.loading = false; },
            complete: () => { this.loading = false; }
        });
    }

    navigatingToSpeedrun(): boolean {
        return this.getReturnUrl().indexOf('speedrun') >= 0;
    }
}


