import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { VehiclesRepositoryPort } from './core/ports/vehicles-repository.port';
import { HttpVehiclesRepositoryService } from './core/services/http-vehicles-repository.service';
import { API_BASE_URL } from './core/tokens/api-base-url.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    {
      provide: API_BASE_URL,
      useValue: '/api',
    },
    {
      provide: VehiclesRepositoryPort,
      useClass: HttpVehiclesRepositoryService,
    },
  ],
};