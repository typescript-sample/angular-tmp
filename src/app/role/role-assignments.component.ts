import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { buildId, message } from 'angularx'
import { confirm } from 'ui-alert';
import { StringMap, getResource, handleError, showMessage, useResource } from 'uione';
import { Role, RoleClient } from './service/role';
import { User, UserClient } from './service/user';

@Component({
  selector: 'app-role-assign',
  templateUrl: './role-assignment.html',
  providers: [RoleClient, UserClient]
})
export class RoleAssignmentsComponent implements OnInit {
  constructor(private route: ActivatedRoute, private roleService: RoleClient, private userService: UserClient) {
    this.resource = useResource();
  }
  resource!: StringMap;
  role: Role = {} as any;
  isCheckboxShown!: boolean;
  users: User[] = [];
  q = '';
  isOpenModel?: false;
  selectedUsers: User[] = [];

  ngOnInit() {
    this.resource = getResource().resource();
    const id = buildId<string>(this.route);
    if (id) {
      const userService = this.userService;
      const roleService = this.roleService;
      Promise.all([
        userService.getUsersByRole(id),
        roleService.load(id),
      ]).then(values => {
        const [users, role] = values;
        if (role) {
          this.users = users;
          this.role = role;
        }
      }).catch(handleError);
    }
  }

  getIds(users?: User[]): string[] {
    return users ? users.map(item => item.userId) : [];
  };
  save(event: Event) {
    event.preventDefault();
    const userIDs = this.getIds(this.users);
    const msg = message(this.resource, 'msg_confirm_save', 'confirm', 'yes', 'no');
    confirm(msg.message, () => {
      this.roleService.assign(this.role.roleId, userIDs).then(result => {
        showMessage(this.resource.msg_save_success);
      }).catch(handleError);
    });
  };

  onShowCheckBox = () => {
    if (this.isCheckboxShown === false) {
      this.isCheckboxShown = true;
    } else {
      this.isCheckboxShown = false;
    }
  }

  onCheckAll() {
    if (this.users) {
      this.selectedUsers = this.users;
    }
  }

  onUnCheckAll() {
    this.selectedUsers = [];
  }

  isChecked(usersChecked: Array<User>, userId: string): boolean {
    if (usersChecked === null || usersChecked === undefined) {
      return false;
    }
    for (let i = 0; i < usersChecked.length; i++) {
      if (usersChecked[i].userId === userId) {
        return true;
      }
    }
    return false;
  }

  onModelSave(arr: User[]) {
    this.users = arr;
    this.isOpenModel = false;
  }
  onModelClose() {
    this.isOpenModel = false;
  }
  onSearch(e: any) {
    const users = this.users;
    if (users) {
      const v = e.target.value;
      const result = users.filter(u => u.username && u.username.includes(v) || u.displayName && u.displayName.includes(v) || u.email && u.email.includes(v));
      (this as any)[e.target.name] = e.target.value;
      this.users = result;
    }
  }

  onDelete() {
    confirm(this.resource.msg_confirm_delete, () => {
      const arr: User[] = [];
      this.users.map(value => {
        const user = this.selectedUsers.find(v => v.userId === value.userId);
        if (!user) {
          arr.push(value);
        }
        return null;
      });
      this.users = arr;
      this.selectedUsers = [];
      this.isCheckboxShown = false;
    })
  }
  onCheck(userId: string) {
    if (this.users) {
      const user = this.users.find(v => v.userId === userId);
      if (user) {
        const index = this.selectedUsers.indexOf(user);
        if (index !== -1) {
          delete this.selectedUsers[index];
        } else {
          this.selectedUsers.push(user);
        }
      }
    }
  }
}