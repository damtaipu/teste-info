import { Routes } from '@angular/router';
import { VehiclesPageComponent } from './features/vehicles/pages/vehicles-page.component';

export const routes: Routes = [
  {
    path: '',
    component: VehiclesPageComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];