import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { addParametersIntoUrl, append, buildMessage, changePage, changePageSize, clone, enLocale, error, formatResults, getFields, handleAppend, handleSortEvent, initElement, initFilter, Locale, optimizeFilter, reset, SearchResult, showPaging } from 'angularx';
import { hideLoading, showLoading } from 'ui-loading';
import { getLocale, handleError, inputSearch, registerEvents, SearchParameter, showMessage, storage, StringMap, useResource } from 'uione';
import { User, UserClient, UserFilter } from './service/user';

@Component({
  selector: 'app-users-lookup',
  templateUrl: './users-lookup.html',
  providers: [UserClient]
})
export class UsersLookupComponent implements OnInit {
  constructor(private viewContainerRef: ViewContainerRef, protected router: Router, private userService: UserClient) {
    this.searchParam = inputSearch();
    this.resource = useResource();
  }

  @Input() selectedUsers: User[] = [];
  protected checked: any[] = [];
  public userId: string = '';
  list: User[] = [];
  searchParam: SearchParameter;
  resource: StringMap;
  form?: HTMLFormElement;
  running?: boolean;
  ignoreUrlParam: boolean = true;
  filter: UserFilter = {} as any;
  locale?: Locale;

  loadTime?: Date;
  loadPage = 1;

  sortField?: string;
  sortType?: string;
  sortTarget?: HTMLElement;

  initPageSize?: number;
  nextPageToken?: string;
  pageSize: number = 20;
  pageIndex: number = 1;
  itemTotal: number = 0;
  total?: number;
  pages?: number;
  showPaging?: boolean;
  append?: boolean;
  appendMode?: boolean;
  appendable?: boolean;

  pageMaxSize = 7;
  pageSizes: number[] = [10, 20, 40, 60, 100, 200, 400, 1000];

  excluding?: string[] | number[];
  fields?: string[];
  initFields?: boolean;

  format?: (obj: User, locale?: Locale) => User;
  sequenceNo = 'sequenceNo';
  triggerSearch?: boolean;
  tmpPageIndex?: number;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSave: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  closeModalFn: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
    this.form = initElement(this.viewContainerRef, registerEvents);
    this.load(this.createSearchModel(), storage.autoSearch);
    this.locale = getLocale() ? getLocale() : enLocale;
  }

  load(s: UserFilter, autoSearch: boolean): void {
    this.loadTime = new Date();
    this.loadPage = this.pageIndex;
    const obj2 = initFilter(s, this);
    this.setFilter(obj2);
    if (autoSearch) {
      setTimeout(() => {
        this.doSearch(true);
      }, 0);
    }
  }

  setFilter(obj: UserFilter): void {
    this.filter = obj;
  }

  getFilter(): UserFilter {
    let obj = this.filter;
    const sf = this.getSearchForm();
    if (this.searchParam.ui && sf) {
      const obj2 = this.searchParam.ui.decodeFromForm(sf, this.locale, this.getCurrencyCode());
      obj = obj2 ? obj2 : {};
    }
    const obj3 = optimizeFilter(obj, this, this.getFields());
    if (this.excluding) {
      obj3.excluding = this.excluding;
    }
    /*
    if (this.keys && this.keys.length === 1) {
      const l = this.getList();
      if (l && l.length > 0) {
        const refId = l[l.length - 1][this.keys[0]];
        if (refId) {
          obj3.refId = '' + refId;
        }
      }
    }
    */
    return obj3;
  }

  getCurrencyCode(): string | undefined {
    if (this.form) {
      const x = this.form.getAttribute('currency-code');
      if (x) {
        return x;
      }
    }
    return undefined;
  }

  getFields(): string[] | undefined {
    if (this.fields) {
      return this.fields;
    }
    if (!this.initFields) {
      if (this.getSearchForm()) {
        this.fields = getFields(this.getSearchForm());
      }
      this.initFields = true;
    }
    return this.fields;
  }

  setList(list: User[]): void {
    this.list = list.filter(item => !this.selectedUsers.some(item2 => item2.userId === item.userId));
  }

  getList(): User[] | undefined {
    return this.list;
  }

  getSearchForm(): HTMLFormElement | undefined {
    return this.form;
  }

  createSearchModel(): UserFilter {
    const obj: any = {};
    return obj;
  }

  onCheckUser(event: any): void {
    if (event.target.checked) {
      const result = this.list.find((value) => value.userId === event.target.value);
      this.checked.push(result);
    } else {
      for (let i = 0; i < this.list.length; i++) {
        if (this.checked[i].userId === event.target.value) {
          this.checked.splice(i, 1);
        }
      }
    }
  }

  onModelSave() {
    this.onSave.emit(this.checked);
    this.checked = [];
    this.closeModalFn.emit(this.checked);
  }

  existInArray(list: Array<Object>, itemSelect: any, fieldName: string) {
    return list.some((item: any) => {
      return item && itemSelect && item[fieldName] === itemSelect[fieldName];
    });
  }

  public clearUserId = () => {
    this.userId = '';
    this.load(this.createSearchModel(), storage.autoSearch);
  }

  onSearch(event: any) {
    event.preventDefault();
    this.resetAndSearch();
  }

  doSearch(isFirstLoad?: boolean) {
    const listForm = this.getSearchForm();
    if (listForm && this.searchParam.ui) {
      this.searchParam.ui.removeFormError(listForm);
    }
    const s: UserFilter = this.getFilter();
    const com = this;
    this.validateSearch(s, () => {
      if (com.running) {
        return;
      }
      com.running = true;
      showLoading()
      if (!this.ignoreUrlParam) {
        addParametersIntoUrl(s, isFirstLoad);
      }
      com.callSearch(s);
    });
  }
  callSearch(ft: UserFilter) {
    const s = clone(ft);
    let page = this.pageIndex;
    if (!page || page < 1) {
      page = 1;
    }
    let offset: number | undefined;
    if (ft.limit) {
      if (ft.firstLimit && ft.firstLimit > 0) {
        offset = ft.limit * (page - 2) + ft.firstLimit;
      } else {
        offset = ft.limit * (page - 1);
      }
    }
    const limit = (page <= 1 && ft.firstLimit && ft.firstLimit > 0 ? ft.firstLimit : ft.limit);
    const next = (this.nextPageToken && this.nextPageToken.length > 0 ? this.nextPageToken : offset);
    const fields = ft.fields;
    delete ft['page'];
    delete ft['fields'];
    delete ft['limit'];
    delete ft['firstLimit'];
    this.userService
      .search(ft, limit, next, fields)
      .then((res) => {
        this.showResults(s, res);
        this.running = false;
      })
      .catch(handleError)
      .finally(hideLoading)
  }
  validateSearch(ft: UserFilter, callback: () => void): void {
    let valid = true;
    const listForm = this.getSearchForm();
    if (listForm) {
      if (this.searchParam.ui && this.searchParam.ui.validateForm) {
        valid = this.searchParam.ui.validateForm(listForm, this.locale);
      }
    }
    if (valid === true) {
      callback();
    }
  }
  // searchError(response: any): void {
  //   if (this.tmpPageIndex) {
  //     this.pageIndex = this.tmpPageIndex;
  //   }
  //   error(response, this.resourceService.value, this.showError);
  // }
  showResults(s: UserFilter, sr: SearchResult<User>): void {
    const com = this;
    const results = sr.list;
    if (results != null && results.length > 0) {
      formatResults(results, this.pageIndex, this.pageSize, this.initPageSize, this.sequenceNo, this.format, this.locale);
    }
    const appendMode = com.appendMode;
    com.pageIndex = (s.page && s.page >= 1 ? s.page : 1);
    if (sr.total) {
      com.itemTotal = sr.total;
    }
    if (appendMode) {
      let limit = s.limit;
      if ((!s.page || s.page <= 1) && s.firstLimit && s.firstLimit > 0) {
        limit = s.firstLimit;
      }
      com.nextPageToken = sr.nextPageToken;
      handleAppend(com, sr.list, limit, sr.nextPageToken);
      if (this.append && (s.page && s.page > 1)) {
        append(this.getList(), results);
      } else {
        this.setList(results);
      }
    } else {
      showPaging(com, sr.list, s.limit, sr.total);
      com.setList(results);
      com.tmpPageIndex = s.page;
      if (s.limit) {
        showMessage(buildMessage(this.searchParam.resource, s.page, s.limit, sr.list, sr.total));
      }
    }
    this.running = false;
    hideLoading();
    if (this.triggerSearch) {
      this.triggerSearch = false;
      this.resetAndSearch();
    }
  }
  resetAndSearch() {
    if (this.running) {
      this.triggerSearch = true;
      return;
    }
    reset(this);
    this.tmpPageIndex = 1;
    this.doSearch();
  }
  onPageSizeChanged(event: Event): void {
    const ctrl = event.currentTarget as HTMLInputElement;
    this.pageSizeChanged(Number(ctrl.value), event);
  }
  pageSizeChanged(size: number, event?: Event): void {
    changePageSize(this, size);
    this.tmpPageIndex = 1;
    this.doSearch();
  }
  pageChanged(event?: any): void {
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
}
