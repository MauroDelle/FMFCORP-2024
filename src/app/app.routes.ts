import { Routes } from '@angular/router';
// import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    // canActivate: [AuthGuard]
  },  
  {
    path: 'splash',
    loadComponent: () => import('./splash/splash.component').then((m) => m.SplashComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registrarse/cliente',
    loadComponent: () => import('./pages/altas/alta-clientes/alta-clientes.component').then((m) => m.AltaClientesComponent),
  },
  {
    path: 'alta-mesa',
    loadComponent: () => import('./pages/altas/alta-mesa/alta-mesa.component').then((m) => m.AltaMesaComponent),
  },
  { 
    path: '', 
    redirectTo: 'splash', 
    pathMatch: 'full'
  },
];