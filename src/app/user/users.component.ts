import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { addParametersIntoUrl, buildFromUrl, buildMessage, buildSort, changePage, changePageSize, clone, getFields, getNumber, getOffset, handleSortEvent, handleToggle, initElement, initFilter, mergeFilter, Pagination, reset, resources, showPaging, Sortable } from 'angularx';
import { Permission, StringMap, getStatusName, handleError, hasPermission, showMessage, useResource } from 'uione';
import { MasterDataClient } from './service/master-data';
import { User, UserClient, UserFilter } from './service/user';
import { hideLoading, showLoading } from 'ui-loading';
import { ValueText } from 'onecore';
import { registerEvents } from 'ui-plus';

@Component({
  selector: 'app-user-list',
  templateUrl: './users.html',
  providers: [UserClient]
})
export class UsersComponent implements OnInit, Sortable, Pagination {
  constructor(private viewContainerRef: ViewContainerRef, private router: Router, private service: UserClient, private masterDataService: MasterDataClient) {
    this.resource = useResource();
    this.canWrite = hasPermission(Permission.write)
  }
  resource: StringMap;
  form?: HTMLFormElement;
  statusList: ValueText[] = [];
  canWrite: boolean;
  hideFilter = true;

  filter: UserFilter = {} as any;
  list: User[] = [];
  fields?: string[];
  view?: string;

  pageMaxSize = 7;
  pageSizes: number[] = resources.pages;
  pageSize = resources.limit;
  pageIndex = 1;
  itemTotal = 0;
  pageTotal?: number;
  showPaging?: boolean;

  // Sortable
  sortField?: string;
  sortType?: string;
  sortTarget?: HTMLElement;

  femaleIcon = "app/assets/images/female.png";
  maleIcon = "app/assets/images/female.png";

  ngOnInit() {
    this.form = initElement(this.viewContainerRef, registerEvents);
    const filter = mergeFilter(buildFromUrl<UserFilter>(), this.filter, this.pageSizes, ['status', 'userType']);
    this.masterDataService.getStatus().then(status => {
      this.statusList = status;
      initFilter(filter, this);
      this.filter = filter;
      this.search(true);
    }).catch(handleError);
  }
  sort(event: Event): void {
    handleSortEvent(event, this);
    this.search();
  }
  onPageSizeChanged(event: Event): void {
    changePageSize(this, getNumber(event));
    this.search();
  }
  onPageChanged(event?: any): void {
    changePage(this, event.page, event.itemsPerPage);
    this.search();
  }
  searchOnClick(event?: Event): void {
    reset(this);
    this.search();
  }
  search(isFirstLoad?: boolean) {
    showLoading();
    addParametersIntoUrl(this.filter, isFirstLoad, this.pageIndex);
    this.fields = getFields(this.form, this.fields);
    const offset = getOffset(this.pageSize, this.pageIndex);
    buildSort(this.filter, this)
    this.service
      .search(this.filter, this.pageSize, offset, this.fields)
      .then((res) => {
        this.list = res.list;
        showPaging(this, res.list, this.pageSize, res.total);
        showMessage(buildMessage(this.resource, this.pageIndex, this.pageSize, res.list, res.total));
      })
      .catch(handleError)
      .finally(hideLoading)
  }

  edit(userId: string) {
    this.router.navigate(['users', userId]);
  }
  add() {
    this.router.navigate(['users/new']);
  }
  changeView(view: string): void {
    this.view = view;
  }
  toggleFilter(event: Event): void {
    this.hideFilter = handleToggle(event.target as HTMLInputElement, this.hideFilter)
  }
  clearQ() {
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
  getStatusName(value: ValueText): string | undefined {
    return value.text ? value.text : getStatusName(value.value, useResource())
  }
}
