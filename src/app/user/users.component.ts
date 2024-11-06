import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { addParametersIntoUrl, buildFromUrl, buildMessage, changePage, changePageSize, clone, getFields, getOffset, handleSortEvent, handleToggle, initElement, initFilter, mergeFilter, navigate, optimizeFilter, reset, showPaging} from 'angularx';
import { Permission, StringMap, getStatusName, handleError, hasPermission, registerEvents, showMessage, storage, useResource } from 'uione';
import { MasterDataClient } from './service/master-data';
import { User, UserClient, UserFilter } from './service/user';
import { hideLoading, showLoading } from 'ui-loading';
import { ValueText } from 'onecore';

interface StatusList {
  value: string,
  title?: string,
}

function initStatusList(values: ValueText[]): StatusList[] {
  const sl: StatusList[] = [];
  values.forEach((v) => {
    sl.push({
      value: v.value,
      title: v.text ? v.text : getStatusName(v.value, useResource()),
    })
  })
  return sl
}
@Component({
  selector: 'app-user-list',
  templateUrl: './users.html',
  providers: [UserClient]
})
export class UsersComponent implements OnInit {
  constructor(private viewContainerRef: ViewContainerRef, protected router: Router, private userService: UserClient, protected masterDataService: MasterDataClient) {
    this.resource = useResource();
    this.canWrite = hasPermission(Permission.write)
  }
  resource: StringMap;
  form?: HTMLFormElement;
  statusList: any[] = [];
  femaleIcon = "app/assets/images/female.png";
  maleIcon = "app/assets/images/female.png";
  canWrite: boolean;

  hideFilter?: boolean;
  filter: UserFilter = {} as any;
  list: User[] = [];
  fields?: string[];

  pageMaxSize = 7;
  pageSizes: number[] = [10, 20, 40, 60, 100, 200, 400, 1000];

  view?: string;
  pageSize = 20;
  pageIndex = 1;
  itemTotal: number = 0;
  pageTotal?: number;
  showPaging?: boolean;

  // Sortable
  sortField?: string;
  sortType?: string;
  sortTarget?: HTMLElement;

  ngOnInit() {
    this.hideFilter = true;
    this.form = initElement(this.viewContainerRef, registerEvents);
    const s = mergeFilter(buildFromUrl<UserFilter>(), this.filter, this.pageSizes, ['ctrlStatus', 'userType']);
    Promise.all([
      this.masterDataService.getStatus()
    ]).then(values => {
      const [status] = values;
      this.statusList = initStatusList(status);
      const obj2 = initFilter(s, this);
      this.filter = obj2;
      setTimeout(() => {
        this.search(true);
      }, 0);
    }).catch(handleError);
  }
  sort(event: Event): void {
    handleSortEvent(event, this);
    this.search();
  }
  onPageSizeChanged(event: Event): void {
    const ele = event.currentTarget as HTMLInputElement;
    changePageSize(this, Number(ele.value));
    this.search();
  }
  onPageChanged(event?: any): void {
    changePage(this, event.page, event.itemsPerPage);
    this.search();
  }
  searchOnClick(event: Event): void {
    reset(this);
    this.search();
  }
  search(isFirstLoad?: boolean) {
    showLoading();
    debugger
    addParametersIntoUrl(this.filter, isFirstLoad, this.pageIndex);
    if (!this.fields) {
      this.fields = getFields(this.form);
    }
    const offset = getOffset(this.pageSize, this.pageIndex);
    optimizeFilter(this.filter, this)
    
    this.userService
      .search(this.filter, this.pageSize, offset, this.fields)
      .then((res) => {
        if (res.total) {
          this.itemTotal = res.total;
        }
        this.list = res.list;
        showPaging(this, res.list, this.pageSize, res.total);
        showMessage(buildMessage(this.resource, this.pageIndex, this.pageSize, res.list, res.total));
      })
      .catch(handleError)
      .finally(hideLoading)
  }

  edit(userId: string) {
    navigate(this.router, 'users', [userId]);
  }
  add() {
    navigate(this.router, 'users/new');
  }
  changeView(v: string, event?: any): void {
    this.view = v;
  }
  toggleFilter(event: any): void {
    this.hideFilter = handleToggle(event.target as HTMLInputElement, this.hideFilter)
  }
  clearQ = () => {
    this.filter.q = '';
  }
  includes(checkedList: Array<string> | string, v: string): boolean {
    return v && checkedList && Array.isArray(checkedList) ? checkedList.includes(v) : false;
  }
  onStatusChanged(event: any, value: string): void {
    let checkedList = this.filter.status ? clone(this.filter.status) : [];
    if (checkedList && Array.isArray(checkedList)) {
      if (event.target.checked) {
        checkedList.push(value)
        this.filter.status = checkedList;
      } else {
        checkedList = checkedList.filter(i => i != value);
        this.filter.status = checkedList;
      }
    }
  }
}
