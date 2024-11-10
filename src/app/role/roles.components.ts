import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { buildFromUrl, initElement, navigate, mergeFilter, initFilter, addParametersIntoUrl, clone, showPaging, buildMessage, reset, changePageSize, changePage, handleSortEvent, handleToggle, resources, Sortable, Pagination, getFields, getOffset, buildSort, getNumber } from 'angularx';
import { StringMap, getStatusName, handleError, hasPermission, registerEvents, showMessage, useResource, write } from 'uione';
import { MasterDataClient } from './service/master-data';
import { Role, RoleClient, RoleFilter } from './service/role';
import { hideLoading, showLoading } from 'ui-loading';
import { ValueText } from 'onecore';

@Component({
  selector: 'app-role-list',
  templateUrl: './roles.html',
  providers: [RoleClient, MasterDataClient]
})
export class RolesComponent implements OnInit, Sortable, Pagination {
  constructor(protected viewContainerRef: ViewContainerRef, protected router: Router, private service: RoleClient, private masterDataService: MasterDataClient) {
    this.resource = useResource();
    this.canWrite = hasPermission(write)
  }
  resource: StringMap;
  form?: HTMLFormElement;
  statusList: ValueText[] = [];
  canWrite: boolean;
  hideFilter = true;

  filter: RoleFilter = {} as any;
  list: Role[] = [];
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

  ngOnInit() {
    this.form = initElement(this.viewContainerRef, registerEvents);
    const filter = mergeFilter(buildFromUrl<RoleFilter>(), this.filter, this.pageSizes, ['status', 'userType']);
    this.masterDataService.getStatus().then(status => {
      this.statusList = status;
      initFilter(filter, this)
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
  edit(roleId: string) {
    navigate(this.router, 'roles', [roleId]);
  }
  addRole() {
    navigate(this.router, 'roles/new');
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
  getStatusName(value: ValueText): string | undefined {
    return value.text ? value.text : getStatusName(value.value, useResource())
  }
}
