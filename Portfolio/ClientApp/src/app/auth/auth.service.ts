import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Credentials } from "./credentials";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    let creds = new Credentials();
    creds.username = username;
    creds.password = password;

    return this.http
      .post<{ token: string; userId: string }>(`/Auth/Login`, creds)
      .pipe(
        map((response) => {
          let token = response.token;
          let userId = response.userId;
          // login successful if there's a jwt token in the response
          if (token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem("jwt", token);
            localStorage.setItem("userId", userId);
            localStorage.setItem("userName", username);
          }

          return token;
        })
      );
  }

  guestLogin() {
    let creds = new Credentials();
    creds.username = "Guest";

    return this.http.post<{ token: string, userId: string }>("/Auth/GuestLogin", creds).pipe(
      map((response) => {
        localStorage.setItem("jwt", response.token);
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("userName", creds.username);
      })
    );
  }

  getHashedPassword(password: string) {
    let creds = new Credentials();
    creds.username = "";
    creds.password = password;
    return this.http.post<{ hash: string }>("Auth/Hash", creds);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem("jwt");
    localStorage.removeItem("userId");
  }
}
