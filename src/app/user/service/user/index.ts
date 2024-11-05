import { HttpRequest } from '@/app/shared/HttpRequest';
import {config} from '@/config';
import { Injectable } from '@angular/core';
import { Client } from 'web-clients';
import { User, UserFilter, userModel, UserService } from './user';

export * from './user';
@Injectable()
export class UserClient extends Client<User, string, UserFilter> implements UserService {
  constructor(http: HttpRequest) {
    super(http, config.user_url, userModel);
    this.searchGet = true;
    this.getUsersByRole = this.getUsersByRole.bind(this);
  }
  getUsersByRole(id: string): Promise<User[]> {
    const url = `${this.serviceUrl}?roleId=${id}`;
    return this.http.get<User[]>(url);
  }
}
