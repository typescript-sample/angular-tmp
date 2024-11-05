import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Router} from '@angular/router';
import {initElement, MessageComponent, navigate} from 'angularx';
import {AuthenClient, AuthInfo, AuthResult, dayDiff, getMessage, handleCookie, initFromCookie, Status, store, validate} from 'authen-client';
import {CookieService} from 'ngx-cookie-service';
import {getLocale, getResource, handleError, loading, message, registerEvents, storage} from 'uione';
import {AuthenticationClient} from './AuthenticationClient';
import {Base64} from 'js-base64';

export const map = {
  '3': 'fail_authentication',
  '4': 'fail_wrong_password',
  '5': 'fail_expired_password',
  '6': 'fail_access_time_locked',
  '7': 'fail_suspended_account',
  '8': 'fail_locked_account',
  '9': 'fail_disabled_account',
  '10': 'fail_disabled_account',
};

const status: Status = {
  success: 0,
  success_and_reactivated: 1,
  two_factor_required: 2,
  fail: 3,
  password_expired: 5
};
@Component({
  selector: 'app-signin',
  templateUrl: './signin.html',
  providers: [AuthenticationClient, CookieService],
})
export class SigninComponent extends MessageComponent implements OnInit {
  constructor(protected viewContainerRef: ViewContainerRef, protected router: Router, protected cookieService: CookieService, authenticationService: AuthenticationClient<AuthInfo>) {
    super(getResource(), getLocale, loading());
    this.authenticationService = authenticationService;
    
  }
  remember = true;
  authenticationService: AuthenClient<AuthInfo>;
  user: AuthInfo = {
    username: '',
    passcode: '',
    password: ''
  };

  ngOnInit() {
    initElement(this.viewContainerRef, registerEvents);
    this.remember = initFromCookie('data', this.user, this.cookieService, Base64);
  }

  forgotPassword() {
    navigate(this.router, 'forgot-password');
  }

  signup() {
    navigate(this.router, 'signup');
  }

  succeed(result: AuthResult) {
    store(result.user, storage.setUser, storage.setPrivileges);
    navigate(this.router, storage.home);
  }
  async signin(event?: any) {

    const r = storage.resource();
    this.user.username = this.user.username.trim();
    if (!validate(this.user, r, this.showError)) {
      return;
    } else {
      this.hideMessage();
    }
    try {

      storage.loading().showLoading();
      const result = await this.authenticationService.authenticate(this.user);
      const s = result.status;
      if (status.success_and_reactivated && (s === status.success || s === status.success_and_reactivated) || s === status.success) {
        handleCookie('data', this.user, this.remember, this.cookieService, 60 * 24 * 3, Base64);
        if (result.user) {
          const expiredDays = dayDiff(result.user.passwordExpiredTime, new Date()) ;
          if (expiredDays && expiredDays > 0) {
            const msg = r.format(r.value('msg_password_expired_soon'), expiredDays);
            message(msg);
          }
        }
        
        if (s === status.success) {          
          this.succeed(result);
        } else {
          this.succeed(result);
          /*
          const message3 = r.value('msg_account_reactivated');
          alertInfo(message3, null, function() {
            this.succeed(result);
          });
          */
        }
      } else if (s !== status.two_factor_required) {
        store(null, storage.setUser, storage.setPrivileges);
        const msg = getMessage(s, r.resource(), map);
        this.showError(msg);
      }
    } catch (err) {      
      handleError(err);
    } finally {
      storage.loading().hideLoading();
    }
  }
}
