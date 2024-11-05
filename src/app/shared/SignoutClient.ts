import {storage} from 'uione';
import {config} from '../../config';
import { HttpRequest } from './HttpRequest';

export interface SignoutService {
  signout(username: string): Promise<boolean>;
}
export class SignoutClient implements SignoutService {
  constructor(private http: HttpRequest) {
  }

  async signout(username: string): Promise<boolean> {
    const url = config.authentication_url + '/authentication/signout/' + username;
    const success = await this.http.get<boolean>(url);
    if (success) {
      sessionStorage.removeItem('authService');
      sessionStorage.clear();
      storage.setUser(null);
    }
    return success;
  }
}
