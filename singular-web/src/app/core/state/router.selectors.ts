import { getRouterSelectors } from '@ngrx/router-store';

export const {
  selectUrl,
  selectRouteParams,
  selectRouteParam,
  selectQueryParams,
  selectQueryParam,
} = getRouterSelectors();
