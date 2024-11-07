import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StringMap, clone, createModel, hasDiff, initElement, isEmptyObject, isSuccessful, makeDiff, setReadOnly } from 'angularx';
import { emailOnBlur, formatter, numberOnFocus, phoneOnBlur, registerEvents, requiredOnBlur, showFormError, validateForm } from 'ui-plus';
import { Status,handleError, hasPermission, useLocale, useResource, write } from 'uione';
import { Gender } from 'uione';
import { MasterDataClient } from './service/master-data';
import { User, UserClient } from './service/user';
import { Item, Result } from 'onecore';
import { hideLoading, showLoading } from 'ui-loading';
import { alertError, alertSuccess, alertWarning, confirm } from 'ui-alert';

function createUser(): User {
  const user = createModel<User>();
  user.status = Status.Active;
  return user;
};

@Component({
  selector: 'app-user-detail',
  templateUrl: './user.html',
  providers: [UserClient]
})
export class UserComponent implements OnInit {
  constructor(private viewContainerRef: ViewContainerRef, private route: ActivatedRoute, private service: UserClient, protected masterDataService: MasterDataClient) {
    this.resource = useResource();
    this.user = createUser();
    this.originUser = createUser();
    this.isReadOnly = !hasPermission(write, 1)
  }
  resource: StringMap;
  form?: HTMLFormElement;
  isReadOnly?: boolean;
  newMode?: boolean;
  id?: string;

  originUser: User;
  user: User;

  titles: Item[] = [];
  positions: Item[] = [];

  ngOnInit() {
    this.form = initElement(this.viewContainerRef, registerEvents);
    this.id = this.route.snapshot.params.id;
    this.newMode = !this.id;
    Promise.all([
      this.masterDataService.getTitles(),
      this.masterDataService.getPositions(),
      this.masterDataService.getGenders()
    ]).then(values => {
      const [titleList, positionList] = values;
      this.titles = titleList;
      this.positions = positionList;
      if (!this.id) {
        this.originUser = clone(this.user);
      } else {
        showLoading();
        this.service
          .load(this.id)
          .then((user) => {
            if (user) {
              this.originUser = clone(user);
              this.user = user;
              if (this.isReadOnly) {
                setReadOnly(this.form)
              }
            } else {
              alertError(this.resource.error_404, () => window.history.back())
            }
          })
          .catch(handleError)
          .finally(hideLoading)
      }
    }).catch(handleError);
  }
  requiredOnBlur(event: Event) {
    requiredOnBlur(event);
  }
  numberOnFocus(event: Event) {
    numberOnFocus(event, useLocale());
  }
  emailOnBlur(event: Event) {
    emailOnBlur(event);
  }
  phoneOnBlur(event: Event) {
    phoneOnBlur(event);
  }
  formatPhone(phone: string) {
    this.user.phone = formatter.formatPhone(phone);
  }
  loadGender(user?: User) {
    user = user === undefined ? this.user : user;
    if (user.title === 'Mr') {
      this.user = { ...user, gender: Gender.Male };
    } else {
      this.user = { ...user, gender: Gender.Female };
    }
  }
  back() {
    if (!hasDiff(this.originUser, this.user)) {
      window.history.back()
    } else {
      confirm(this.resource.msg_confirm_back, () => window.history.back())
    }
  }
  validate(): boolean {
    return validateForm(this.form, useLocale())
  }
  save(event: Event): void {
    event.preventDefault()
    const valid = this.validate()
    if (valid) {
      confirm(this.resource.msg_confirm_save, () => {
        if (this.newMode) {
          showLoading();
          this.service
            .create(this.user)
            .then((res) => this.afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        } else {
          const diff = makeDiff(this.originUser, this.user, ["userId"])
          if (isEmptyObject(diff)) {
            alertWarning(this.resource.msg_no_change)
          } else {
            showLoading()
            this.service
              .update(this.user)
              .then((res) => this.afterSaved(res))
              .catch(handleError)
              .finally(hideLoading)
          }
        }
      })
    }
  }
  afterSaved(res: Result<User>): void {
    if (Array.isArray(res)) {
      showFormError(this.form, res)
    } else if (isSuccessful(res)) {
      alertSuccess(this.resource.msg_save_success, () => window.history.back())
    } else if (res === 0) {
      alertError(this.resource.error_not_found)
    } else {
      alertError(this.resource.error_conflict)
    }
  }
}
