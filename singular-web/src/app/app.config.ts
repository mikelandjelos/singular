import { projectReducer } from './features/project/state/project.reducer';
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
import { AuthEffects, authReducer } from './features/auth/state';
import { provideMarkdown } from 'ngx-markdown';
import { UserEffects, userReducer } from './features/user/state';
import { ProjectEffects } from './features/project/state/project.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' })),
    provideHttpClient(withInterceptors([httpCredentialsInterceptor])),
    provideStore({
      auth: authReducer,
      user: userReducer,
      project: projectReducer,
      router: routerReducer,
    }),
    provideEffects([AuthEffects, UserEffects, ProjectEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideRouterStore(),
    provideMarkdown(),
  ],
};
