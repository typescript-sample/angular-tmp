import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Locale, SearchComponent, SearchResult, addParametersIntoUrl, append, buildFromUrl, buildMessage, changePage, changePageSize, clone, formatResults, getModelName, handleAppend, handleSortEvent, handleToggle, initElement, initFilter, mergeFilter, navigate, reset, setValue, showPaging, valueOfCheckbox } from 'angularx';
import { SearchParameter, StringMap, getStatusName, handleError, inputSearch, registerEvents, showMessage, storage, useLocale, useResource } from 'uione';
import { MasterDataClient } from './service/master-data';
import { User, UserClient, UserFilter } from './service/user';
import { hideLoading, showLoading } from 'ui-loading';
import { getNextPageToken } from '../core';
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
    this.searchParam = inputSearch();
    this.resource = useResource();
  }
  searchParam: SearchParameter;
  resource: StringMap;
  form?: HTMLFormElement;
  addable: boolean = true;
  statusList: any[] = [];
  femaleIcon = "app/assets/images/female.png";
  maleIcon = "app/assets/images/female.png";
  viewable: boolean = true;
  editable: boolean = true;

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
  nextPageToken?: string;
  initPageSize = 20;
  pageSize = 20;
  pageIndex = 1;
  itemTotal: number = 0;
  pageTotal?: number;
  showPaging?: boolean;
  append?: boolean;
  appendMode?: boolean;
  appendable?: boolean;

  // Sortable
  sortField?: string;
  sortType?: string;
  sortTarget?: HTMLElement;

  format?: (obj: User, locale?: Locale) => User;
  sequenceNo = 'sequenceNo';
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
          this.doSearch(true);
        }, 0);
      }
    }).catch(handleError);
  }
  doSearch(isFirstLoad?: boolean) {
    showLoading();
    if (!this.ignoreUrlParam) {
      addParametersIntoUrl(this.filter, isFirstLoad);
    }
    const s = clone(this.filter);
    const next = getNextPageToken(this.filter);
    this.userService
      .search(this.filter, this.filter.limit, next, this.filter.fields)
      .then((res) => {
        this.showResults(s, res);
      })
      .catch(handleError)
      .finally(hideLoading)
  }

  showResults(s: UserFilter, sr: SearchResult<User>): void {
    const results = sr.list;
    this.pageIndex = (s.page && s.page >= 1 ? s.page : 1);
    if (sr.total) {
      this.itemTotal = sr.total;
    }
    showPaging(this, sr.list, s.limit, sr.total);
    this.list = results;
    this.tmpPageIndex = s.page;
    if (s.limit) {
      showMessage(buildMessage(this.searchParam.resource, s.page, s.limit, sr.list, sr.total));
    }
    hideLoading();
    if (this.triggerSearch) {
      this.triggerSearch = false;
      this.resetAndSearch();
    }
  }
  resetAndSearch() {
    reset(this);
    this.tmpPageIndex = 1;
    this.doSearch();
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
    const x = !this.hideFilter;
    handleToggle(event.target as HTMLInputElement, !x)
    this.hideFilter = x;
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
  onPageSizeChanged(event: Event): void {
    const ctrl = event.currentTarget as HTMLInputElement;
    changePageSize(this, Number(ctrl.value));
    this.tmpPageIndex = 1;
    this.doSearch();
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
    this.doSearch();
  }
  sort(event: Event): void {
    handleSortEvent(event, this);
    if (!this.appendMode) {
      this.doSearch();
    } else {
      this.resetAndSearch();
    }
  }
  search(event: Event): void {
    if (event && !this.form) {
      const f = (event.currentTarget as HTMLInputElement).form;
      if (f) {
        this.form = f;
      }
    }
    this.resetAndSearch();
  }
}
