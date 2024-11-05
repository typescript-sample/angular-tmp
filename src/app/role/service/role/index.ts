import { Inject, Injectable } from '@angular/core';
import { HttpRequest } from '@/app/shared/HttpRequest';
import {  Client, GenericSearchClient } from 'web-clients';
import { Privilege, Role, RoleFilter, roleModel, RoleService } from './role';
import {config} from '@/config';
import { ResultInfo } from 'onecore';

export * from './role';

@Injectable()
export class RoleClient extends Client<Role, string, RoleFilter> implements RoleService {
  constructor(http: HttpRequest) {
    super(http,config.role_url,roleModel);
    this.assign = this.assign.bind(this);
    this.getPrivileges = this.getPrivileges.bind(this);
    this.getRoles = this.getRoles.bind(this);
    this.searchGet = true;

  }
  assign(roleId: string, users: string[]): Promise<number> {
    return this.http.put<number>(`${this.serviceUrl}/${roleId}/assign`, users);
  }
  getPrivileges(): Promise<Privilege[]> {
    return this.http.get<Privilege[]>(config.privilege_url);
  }
  getRoles(): Promise<Role[]> {
    return this.http.get<Role[]>(config.role_url);
  }

}
