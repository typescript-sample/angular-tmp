import { Filter, Pagination, Sortable, clone, getPageTotal, isSuccessful, makeDiff } from "angularx";
import { Result } from "onecore";
import { ErrorMessage, StringMap } from "uione";

export function isEmptyObject(obj: any): boolean {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};
export function hasDiff<T>(o1: T, o2: T, keys?: string[], version?: string): boolean {
  const diff = makeDiff(o1, o2, keys, version)
  return !isEmptyObject(diff)
}
export function goBack<T>(confirm: (msg: string, yesCallback?: () => void) => void, resource: StringMap, o1: T, o2: T, keys?: string[], version?: string) {
  if (!hasDiff(o1, o2, keys, version)) {
    window.history.back()
  } else {
    confirm(resource.msg_confirm_back, () => window.history.back())
  }
}
export function afterSaved<T>(res: Result<T>, form: HTMLFormElement|undefined, resource: StringMap, showFormError: (form?: HTMLFormElement, errors?: ErrorMessage[]) => ErrorMessage[], alertSuccess: (msg: string, callback?: () => void) => void, alertError :(msg: string) => void) {
  if (Array.isArray(res)) {
    showFormError(form, res)
  } else if (isSuccessful(res)) {
    alertSuccess(resource.msg_save_success, () => window.history.back())
  } else if (res === 0) {
    alertError(resource.error_not_found)
  } else {
    alertError(resource.error_conflict)
  }
}
export function format(...args: any[]): string {
  let formatted = args[0]
  if (!formatted || formatted === "") {
    return ""
  }
  if (args.length > 1 && Array.isArray(args[1])) {
    const params = args[1]
    for (let i = 0; i < params.length; i++) {
      const regexp = new RegExp("\\{" + i + "\\}", "gi")
      formatted = formatted.replace(regexp, params[i])
    }
  } else {
    for (let i = 1; i < args.length; i++) {
      const regexp = new RegExp("\\{" + (i - 1) + "\\}", "gi")
      formatted = formatted.replace(regexp, args[i])
    }
  }
  return formatted
}
export function buildMessage<T>(resource: StringMap, pageIndex: number|undefined, pageSize: number, results: T[], total?: number): string {
  if (!results || results.length === 0) {
    return resource.msg_no_data_found;
  } else {
    if (!pageIndex) {
      pageIndex = 1;
    }
    const fromIndex = (pageIndex - 1) * pageSize + 1;
    const toIndex = fromIndex + results.length - 1;
    const pageTotal = getPageTotal(pageSize, total);
    if (pageTotal > 1) {
      const msg2 = format(resource.msg_search_result_page_sequence, fromIndex, toIndex, total, pageIndex, pageTotal);
      return msg2;
    } else {
      const msg3 = format(resource.msg_search_result_sequence, fromIndex, toIndex);
      return msg3;
    }
  }
}
export function handleToggle(target?: HTMLInputElement, on?: boolean): boolean {
  const off = !on
  if (target) {
    if (on) {
      if (!target.classList.contains('on')) {
        target.classList.add('on');
      }
    } else {
      target.classList.remove('on');
    }
  }
  return off
}
export function getOffset(limit: number, page?: number, firstLimit?: number): number {
  const p = (page && page > 0 ? page : 1)
  if (firstLimit && firstLimit > 0) {
    const offset = limit * (p - 2) + firstLimit;
    return offset < 0 ? 0 : offset;
  } else {
    const offset = limit * (p - 1);
    return offset < 0 ? 0 : offset;
  }
}
interface Searchable extends Pagination, Sortable {
}

export function optimizeFilter<S extends Filter>(obj: S, searchable: Searchable, fields?: string[]): S {
  debugger
  obj.fields = fields;
  if (searchable.pageIndex && searchable.pageIndex > 1) {
    obj.page = searchable.pageIndex;
  } else {
    delete obj.page;
  }
  obj.limit = searchable.pageSize;
  if (searchable.appendMode && searchable.initPageSize !== searchable.pageSize) {
    obj.firstLimit = searchable.initPageSize;
  } else {
    delete obj.firstLimit;
  }
  if (searchable.sortField && searchable.sortField.length > 0) {
    obj.sort = (searchable.sortType === '-' ? '-' + searchable.sortField : searchable.sortField);
  } else {
    delete obj.sort;
  }
  return obj;
}

export function getNextPageToken<S extends Filter>(s: S, page?: number, nextPageToken?: string): string | number | undefined {
  const ft = clone(s);
  if (!page || page < 1) {
    page = 1;
  }
  let offset: number | undefined;
  if (s.limit) {
    if (s.firstLimit && ft.firstLimit > 0) {
      offset = ft.limit * (page - 2) + ft.firstLimit;
    } else {
      offset = ft.limit * (page - 1);
    }
  }
  s.limit = (page <= 1 && ft.firstLimit && ft.firstLimit > 0 ? ft.firstLimit : ft.limit);
  const next = (nextPageToken && nextPageToken.length > 0 ? nextPageToken : offset);
  // const fields = ft.fields;
  delete ft['page'];
  delete ft['fields'];
  delete ft['limit'];
  delete ft['firstLimit'];
  return next;
}

// function showAppendResults<S extends Filter>(s: S, sr: SearchResult<T>): void {
//   let limit = s.limit;
//   if ((!s.page || s.page <= 1) && s.firstLimit && s.firstLimit > 0) {
//     limit = s.firstLimit;
//   }
//   com.nextPageToken = sr.nextPageToken;
//   handleAppend(com, sr.list, limit, sr.nextPageToken);
//   if (this.append && (s.page && s.page > 1)) {
//     append(this.getList(), results);
//   } else {
//     this.setList(results);
//   }
// }
