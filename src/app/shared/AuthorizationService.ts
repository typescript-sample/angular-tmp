import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {isAuthorized} from 'angularx';
import {storage} from 'uione';

@Injectable()
export class AuthorizationService implements CanActivate {
  constructor(public router: Router) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return isAuthorized(storage.user(), this.router, storage.authentication, state.url, storage.getPrivileges(), storage.home);
  }
}
