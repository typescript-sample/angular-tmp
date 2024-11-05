import {Injectable} from '@angular/core';
import {AuthenticationClient as BaseAuthenticationClient, AuthInfo, AuthResult} from 'authen-client';
import {config} from '../../config';
import {HttpRequest} from '../shared/HttpRequest';

@Injectable()
export class AuthenticationClient<T extends AuthInfo> extends BaseAuthenticationClient<T> {
  constructor(http: HttpRequest) {
    super(http, config.authentication_url + '/authenticate');
  }

  authenticateByOAuth2(user: AuthInfo): Promise<AuthResult> {
    const url = config.authentication_url + '/oauth2/authenticate';
    return this.http.post<AuthResult>(url, user);
  }
}
