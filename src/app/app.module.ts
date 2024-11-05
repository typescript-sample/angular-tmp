import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpRequest } from './shared/HttpRequest';
import { MainComponent } from './shared/main.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from './shared/AuthenticationService';
import { AuthorizationService } from './shared/AuthorizationService';
import { PaginationModule } from 'ngx-bootstrap/pagination';

  
@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    // BsDropdownModule.forRoot(),
    PaginationModule.forRoot()
    // ModalModule.forRoot()
    ],
  providers: [
    HttpRequest,
    AuthenticationService,
    CookieService,
    AuthorizationService,

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
