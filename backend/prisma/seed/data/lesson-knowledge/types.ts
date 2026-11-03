/** Một gói kiến thức: áp cho bài video có tên khớp `match` (so trên tên bài viết thường) */
export interface Pack {
  match: RegExp;
  text: string;
}
