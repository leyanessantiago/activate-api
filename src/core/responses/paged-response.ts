export interface PagedResponse<T> {
  results: T[];
  count: number;
  page: number;
}
