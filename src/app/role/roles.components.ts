import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { buildFromUrl, initElement, navigate, Locale, mergeFilter, initFilter, addParametersIntoUrl, clone, SearchResult, formatResults, handleAppend, append, showPaging, buildMessage, reset, changePageSize, changePage, handleSortEvent, handleToggle, valueOfCheckbox, setValue, getModelName } from 'angularx';
import { SearchParameter, StringMap, handleError, hasPermission, inputSearch, registerEvents, showMessage, storage, useLocale, useResource, write } from 'uione';
import { MasterDataClient } from './service/master-data';
import { Role, RoleClient, RoleFilter } from './service/role';
import { hideLoading, showLoading } from 'ui-loading';

@Component({
  selector: 'app-role-list',
  templateUrl: './roles.html',
  providers: [RoleClient, MasterDataClient]
})
export class RolesComponent implements OnInit {
  constructor(protected viewContainerRef: ViewContainerRef, protected router: Router, private roleService: RoleClient, private masterDataService: MasterDataClient) {
    this.searchParam = inputSearch();
    this.resource = useResource();
    this.canWrite = hasPermission(write)
  }
  searchParam: SearchParameter;
  resource: StringMap;
  form?: HTMLFormElement;
  canWrite: boolean;
  running?: boolean;
  status: any = [];
  locale?: Locale;

  excluding?: string[] | number[];
  hideFilter?: boolean;
  ignoreUrlParam?: boolean;
  filter: RoleFilter = {} as any;
  list?: Role[];

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

  format?: (obj: Role, locale?: Locale) => Role;
  sequenceNo = 'sequenceNo';
  triggerSearch?: boolean;
  tmpPageIndex?: number;

  ngOnInit() {
    this.form = initElement(this.viewContainerRef, registerEvents);
    const s = mergeFilter(buildFromUrl<RoleFilter>(), this.filter, this.pageSizes, ['ctrlStatus', 'userType']);
    this.init(s, storage.autoSearch);
    this.hideFilter = true;
  }
  init(s: RoleFilter, auto: boolean) {
    Promise.all([
      this.masterDataService.getStatus()
    ]).then(values => {
      const [status] = values;
      this.status = status;
      this.load(s, auto);
    }).catch(handleError);
  }
  load(s: RoleFilter, autoSearch: boolean): void {
    this.loadTime = new Date();
    this.loadPage = this.pageIndex;
    const obj2 = initFilter(s, this);
    this.filter = obj2;
    if (autoSearch) {
      setTimeout(() => {
        this.doSearch(true);
      }, 0);
    }
  }
  doSearch(isFirstLoad?: boolean) {
    const listForm = this.form;
    if (listForm && this.searchParam.ui) {
      this.searchParam.ui.removeFormError(listForm);
    }
    const s: RoleFilter = this.filter;
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
  callSearch(ft: RoleFilter) {
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
    this.roleService
      .search(ft, limit, next, fields)
      .then((res) => {
        this.showResults(s, res);
        this.running = false;
      })
      .catch(handleError)
      .finally(hideLoading)
  }
  validateSearch(ft: RoleFilter, callback: () => void): void {
    let valid = true;
    const listForm = this.form;
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
  showResults(s: RoleFilter, sr: SearchResult<Role>): void {
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
        append(this.list, results);
      } else {
        this.list = results;
      }
    } else {
      showPaging(com, sr.list, s.limit, sr.total);
      this.list = results;
      com.tmpPageIndex = s.page;
      if (s.limit) {
        showMessage(buildMessage(this.resource, s.page, s.limit, sr.list, sr.total));
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
  updateState(event: Event) {
    const locale: Locale = useLocale();
    const ctrl = event.currentTarget as HTMLInputElement;
    let modelName: string | null = getModelName();
    if (!modelName && ctrl.form) {
      modelName = ctrl.form.getAttribute('model-name');
    }
    const type = ctrl.getAttribute('type');
    const isPreventDefault = type && (['checkbox', 'radio'].indexOf(type.toLowerCase()) >= 0 ? false : true);
    if (isPreventDefault) {
      event.preventDefault();
    }
    if (this.searchParam.ui && ctrl.nodeName === 'SELECT' && ctrl.value && ctrl.classList.contains('invalid')) {
      this.searchParam.ui.removeError(ctrl);
    }
    if (modelName) {
      const ex = (this as any)[modelName];
      const dataField = ctrl.getAttribute('data-field');
      const field = (dataField ? dataField : ctrl.name);
      if (type && type.toLowerCase() === 'checkbox') {
        const v = valueOfCheckbox(ctrl);
        setValue(ex, field, v);
      } else {
        let v = ctrl.value;
        if (this.searchParam.ui) {
          v = this.searchParam.ui.getValue(ctrl, locale) as string;
        }
        // tslint:disable-next-line:triple-equals
        if (ctrl.value != v) {
          setValue(ex, field, v);
        }
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
  viewRole(roleId: string) {
    navigate(this.router, 'roles', [roleId]);
  }

  edit(roleId: string) {
    navigate(this.router, 'roles', [roleId]);
  }

  addRole() {
    navigate(this.router, 'roles/new');
  }
}
