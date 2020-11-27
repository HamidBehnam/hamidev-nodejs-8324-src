import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {AuthModule} from "@auth0/auth0-angular";
import {environment} from "../environments/environment";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AuthModule.forRoot({
      domain: environment.auth0_domain,
      clientId: environment.auth0_client_id,
      audience: environment.auth0_audience
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
