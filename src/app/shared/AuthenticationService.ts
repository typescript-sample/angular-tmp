import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {isAuthorized} from 'angularx';
import {storage, user} from 'uione';

@Injectable()
export class AuthenticationService implements CanActivate {
  constructor(public router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return isAuthorized(user(), this.router, storage.authentication);
  }
}
