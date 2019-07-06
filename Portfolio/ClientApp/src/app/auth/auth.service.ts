import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Credentials } from './credentials';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: Http) { }

  login(username: string, password: string) {
    let creds = new Credentials();
    creds.username = username;
    creds.password = password;
    return this.http.post(`/Auth/Login`, creds)
      .pipe(map(response => {
        let token = response.json().token;
        // login successful if there's a jwt token in the response
        if (token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('jwt', token);
        }

        return token;
      }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('jwt');
  }
}
