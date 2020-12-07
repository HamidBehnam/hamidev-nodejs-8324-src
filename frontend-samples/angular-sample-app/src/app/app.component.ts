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

  constructor(public authService: AuthService) {
    this.authService.user$.subscribe(user => {
      console.log(user);
    });
  }

  getAccessToken() {
    this.authService.getAccessTokenSilently().subscribe(token => this.accessToken = token);
  }
}
