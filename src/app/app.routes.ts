import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SeatsComponent } from './seats/seats.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirección inicial
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'seats', component: SeatsComponent },
  { path: '**', redirectTo: 'login' } // Ruta comodín
];
