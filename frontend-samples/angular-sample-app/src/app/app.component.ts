import { Component } from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import jwt_decode from "jwt-decode";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-sample-app';
  accessToken: string;
  accessTokenDecoded: any;

  constructor(public authService: AuthService) {
    this.authService.user$.subscribe(user => {
      console.log(user);
    });
  }

  async getAccessToken() {
    this.authService.getAccessTokenSilently({
      ignoreCache: true
    }).subscribe(token => {
      this.accessToken = token;
      this.accessTokenDecoded = jwt_decode(this.accessToken);
    });
  }
}
