import {Component} from '@angular/core';

@Component({
  selector: 'app-authentication-module',
  template: '<div class="authentication"><router-outlet></router-outlet></div>'
})
export class AuthenticationComponent {
  constructor() {
  }
}
