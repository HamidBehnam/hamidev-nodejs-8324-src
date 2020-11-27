import { Component } from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-sample-app';
  accessToken: string;

  constructor(public auth: AuthService) {
    this.auth.user$.subscribe(user => {
      console.log(user);
    });
  }

  getAccessToken() {
    this.auth.getAccessTokenSilently().subscribe(token => this.accessToken = token);
  }
}
