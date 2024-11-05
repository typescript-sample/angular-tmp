import { Filter, Pagination, append, clone, handleAppend, showPaging } from "angularx";

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
