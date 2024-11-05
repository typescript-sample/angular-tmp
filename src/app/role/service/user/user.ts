import { Attributes, Filter, Service, Tracking } from 'onecore';

export interface UserFilter extends Filter {
  userId: string;
  username: string;
  email: string;
  displayName: string;
  status: string[] | string;
}
export interface User extends Tracking {
  userId: string;
  username: string;
  email: string;
  displayName: string;
  imageURL?: string;
  status: string;
  gender?: string;
  phone?: string;
  title?: string;
  position?: string;
  roles?: string[];
}
export interface UserService extends Service<User, string, UserFilter> {
  getUsersByRole(id: string): Promise<User[]>;
}

export const userModel: Attributes = {
  userId: {
    key: true
  },
  username: {
    length: 255,
    required: true
  },
  firstName: {
    length: 255
  },
  lastName: {
    length: 255
  },
  gender: {
    length: 1
  },
  dateOfBirth: {
    type: 'date'
  },
  email: {
    length: 255
  },
  phone: {
    length: 20
  },
  createdBy: {
    length: 40
  },
  createdAt: {
    type: 'datetime'
  },
  updatedBy: {
    length: 40
  },
  updatedAt: {
    type: 'datetime'
  }
};
