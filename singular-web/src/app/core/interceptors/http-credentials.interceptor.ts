import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Adds `withCredentials=true` to API requests based on environment.apiUrl.
 * Works for both relative ("/api") and absolute ("https://api.example.com") bases.
 */
export const httpCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = (environment.apiUrl || '').replace(/\/+$/, ''); // trim trailing slash
  const url = req.url;

  const isAbsolute = /^https?:\/\//i.test(url);
  let shouldAttach = false;

  if (!apiBase) {
    shouldAttach = false;
  } else if (apiBase.startsWith('/')) {
    // Relative base (dev proxy), match on path prefix
    // Normalize request URL to path (absolute URLs won't match here)
    shouldAttach = !isAbsolute && url.startsWith(apiBase);
  } else {
    // Absolute base (prod), match full URL prefix
    shouldAttach = url.startsWith(apiBase);
  }

  return next(shouldAttach ? req.clone({ withCredentials: true }) : req);
};
