import { Routes } from '@angular/router';
import { LoginComponent } from './screens/login/login.component';
import { HomeComponent } from './screens/home/home.component';
import { SeatsComponent } from './screens/seats/seats.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirección inicial
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'seats', component: SeatsComponent },
  { path: '**', redirectTo: 'login' } // Ruta comodín
];
