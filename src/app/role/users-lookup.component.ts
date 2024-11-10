import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { buildMessage, buildSort, changePage, changePageSize, getFields, getNumber, getOffset, handleSortEvent, initElement, initFilter, Pagination, reset, resources, showPaging, Sortable } from 'angularx';
import { hideLoading, showLoading } from 'ui-loading';
import { handleError, registerEvents, showMessage, StringMap, useResource } from 'uione';
import { User, UserClient, UserFilter } from './service/user';

@Component({
  selector: 'app-users-lookup',
  templateUrl: './users-lookup.html',
  providers: [UserClient]
})
export class UsersLookupComponent implements OnInit, Sortable, Pagination {
  constructor(private viewContainerRef: ViewContainerRef, protected router: Router, private service: UserClient) {
    this.resource = useResource();
  }

  @Input() selectedUsers: User[] = [];
  resource: StringMap;
  form?: HTMLFormElement;

  filter: UserFilter = {} as any;
  list: User[] = [];
  fields?: string[];

  pageMaxSize = 7;
  pageSizes: number[] = resources.pages;
  pageSize: number = resources.limit;
  pageIndex: number = 1;
  itemTotal: number = 0;
  pageTotal?: number;
  showPaging?: boolean;

  // Sortable
  sortField?: string;
  sortType?: string;
  sortTarget?: HTMLElement;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSave: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  closeModalFn: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
    this.form = initElement(this.viewContainerRef, registerEvents);
    initFilter(this.filter, this);
    this.search();
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
  search() {
    showLoading();
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
  clearQ() {
    this.filter.q = '';
  }
  includes(value: string): boolean {
    return this.selectedUsers.filter(u => u.userId === value).length > 0
  }
  onCheckUser(event: any): void {
    if (event.target.checked) {
      const user = this.list.find((u) => u.userId === event.target.value);
      if (user) {
        this.selectedUsers.push(user);
      }
    } else {
      const users = this.selectedUsers.filter(u => u.userId !== event.target.value);
      this.selectedUsers = users;
    }
  }
  createSearchModel(): UserFilter {
    const obj: any = {};
    return obj;
  }
  onModelSave() {
    this.onSave.emit(this.selectedUsers);
    this.closeModalFn.emit();
  }
}
