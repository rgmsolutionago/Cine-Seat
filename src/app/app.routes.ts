import { Routes } from '@angular/router';
import { LoginComponent } from './view/login/login.component';
import { HomeComponent } from './view/home/home.component';
import { SeatsComponent } from './view/seats/seats.component';
import { LoadingComponent } from './view/loading/loading.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirección inicial
  { path: 'login', component: LoginComponent },
  { path: 'loading', component: LoadingComponent },
  { path: 'home', component: HomeComponent },
  { path: 'seats', component: SeatsComponent },
  { path: '**', redirectTo: 'login' } // Ruta comodín
];
