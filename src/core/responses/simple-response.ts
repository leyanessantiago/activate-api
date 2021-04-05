import { ISimpleResponse } from './isimple-response';

export class SimpleResponse<T> {
  data: T;

  constructor(simpleResponse: ISimpleResponse<T>) {
    this.data = simpleResponse.data;
  }
}
