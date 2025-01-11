import { Routes } from '@angular/router';
import { LoginComponent } from './view/login/login.component';
import { HomeComponent } from './view/home/home.component';
import { SeatsComponent } from './view/seats/seats.component';

export const routes: Routes = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirección inicial
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: HomeComponent },
  { path: 'seats/:movie/:schedule/:date', component: SeatsComponent },
  { path: '**', redirectTo: 'login' } // Ruta comodín
];