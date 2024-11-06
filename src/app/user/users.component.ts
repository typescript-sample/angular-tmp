import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Locale, addParametersIntoUrl, buildFromUrl, changePage, changePageSize, clone, handleSortEvent, initElement, initFilter, mergeFilter, navigate, optimizeFilter, reset, showPaging} from 'angularx';
import { Permission, StringMap, getStatusName, handleError, hasPermission, registerEvents, showMessage, storage, useResource } from 'uione';
import { MasterDataClient } from './service/master-data';
import { User, UserClient, UserFilter } from './service/user';
import { hideLoading, showLoading } from 'ui-loading';
import { buildMessage, getNextPageToken, getPage, handleToggle } from '../core';
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
  ignoreUrlParam?: boolean;
  filter: UserFilter = {} as any;
  list?: User[];
  locale?: Locale;
  loadTime?: Date;
  loadPage = 1;

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

  triggerSearch?: boolean;
  tmpPageIndex?: number;

  ngOnInit() {
    this.hideFilter = true;
    this.form = initElement(this.viewContainerRef, registerEvents);
    const s = mergeFilter(buildFromUrl<UserFilter>(), this.filter, this.pageSizes, ['ctrlStatus', 'userType']);
    Promise.all([
      this.masterDataService.getStatus()
    ]).then(values => {
      const [status] = values;
      this.statusList = initStatusList(status);
      this.loadTime = new Date();
      this.loadPage = this.pageIndex;
      const obj2 = initFilter(s, this);
      this.filter = obj2;
      if (storage.autoSearch) {
        setTimeout(() => {
          this.search(true);
        }, 0);
      }
    }).catch(handleError);
  }
  
  onPageSizeChanged(event: Event): void {
    const ctrl = event.currentTarget as HTMLInputElement;
    changePageSize(this, Number(ctrl.value));
    this.tmpPageIndex = 1;
    this.search();
  }
  onPageChanged(event?: any): void {
    if (this.loadTime) {
      const now = new Date();
      const d = Math.abs(this.loadTime.getTime() - now.getTime());
      if (d < 610) {
        if (event) {
          if (event.page && event.itemsPerPage && event.page !== this.loadPage) {
            changePage(this, this.loadPage, event.itemsPerPage);
          }
        }
        return;
      }
    }
    changePage(this, event.page, event.itemsPerPage);
    this.search();
  }
  sort(event: Event): void {
    handleSortEvent(event, this);
    this.search();
  }
  searchOnClick(event: Event): void {
    if (event && !this.form) {
      const f = (event.currentTarget as HTMLInputElement).form;
      if (f) {
        this.form = f;
      }
    }
    this.resetAndSearch();
  }
  getFilter(): UserFilter {
    let obj = this.filter;
    const obj3 = optimizeFilter(obj, this);
    return obj3
  }
  search(isFirstLoad?: boolean) {
    showLoading();
    if (!this.ignoreUrlParam) {
      addParametersIntoUrl(this.filter, isFirstLoad);
    }
    const s = this.getFilter();
    const next = getNextPageToken(this.filter);
    this.userService
      .search(this.filter, this.filter.limit, next, this.filter.fields)
      .then((res) => {
        this.pageIndex = getPage(s.page)
        if (res.total) {
          this.itemTotal = res.total;
        }
        showPaging(this, res.list, s.limit, res.total);
        this.list = res.list;
        this.tmpPageIndex = s.page;
        if (s.limit) {
          showMessage(buildMessage(this.resource, s.page, s.limit, res.list, res.total));
        }
        hideLoading();
        if (this.triggerSearch) {
          this.triggerSearch = false;
          this.resetAndSearch();
        }
      })
      .catch(handleError)
      .finally(hideLoading)
  }
  resetAndSearch() {
    reset(this);
    this.tmpPageIndex = 1;
    this.search();
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
