import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpCredentialsInterceptor } from './core/interceptors/';
import { AuthEffects, authReducer } from './auth/state';
import { provideMarkdown } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // TODO: this has a potential to be buggy
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideHttpClient(withInterceptors([httpCredentialsInterceptor])),
    provideStore({ auth: authReducer, router: routerReducer }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideRouterStore(),
    provideMarkdown(),
  ],
};
