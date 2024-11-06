import { Filter, clone, isSuccessful, makeDiff } from "angularx";
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
  // delete ft['fields'];
  // delete ft['limit'];
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
