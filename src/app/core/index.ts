import { Filter, Sortable, formatText, getPageTotal } from "angularx";
import { StringMap } from "uione";

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
      const msg2 = formatText(resource.msg_search_result_page_sequence, fromIndex, toIndex, total, pageIndex, pageTotal);
      return msg2;
    } else {
      const msg3 = formatText(resource.msg_search_result_sequence, fromIndex, toIndex);
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
export function optimizeFilter<S extends Filter>(obj: S, sortable: Sortable): S {
  if (sortable.sortField && sortable.sortField.length > 0) {
    obj.sort = (sortable.sortType === '-' ? '-' + sortable.sortField : sortable.sortField);
  } else {
    delete obj.sort;
  }
  delete obj.page;
  delete obj.limit;
  delete obj.fields;
  return obj
}
