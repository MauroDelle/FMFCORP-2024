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
    path: 'registrarse-cliente',
    loadComponent: () => import('./pages/altas/alta-clientes/alta-clientes.component').then((m) => m.AltaClientesComponent),
  },
  {
    path: 'alta-mesa',
    loadComponent: () => import('./pages/altas/alta-mesa/alta-mesa.component').then((m) => m.AltaMesaComponent),
  },
  {
    path: 'alta-producto',
    loadComponent: () => import('./pages/altas/alta-producto/alta-producto.component').then((m) => m.AltaProductoComponent),
  },
  {
    path: 'gestion-clientes',
    loadComponent: () => import('./pages/gestion-clientes/gestion-clientes.component').then((m) => m.GestionClientesComponent),
  },
  {
    path: 'qr-mesa',
    loadComponent: () => import('./pages/qr-mesa/qr-mesa.component').then((m) => m.QrMesaComponent),
  },
  {
    path: 'maitre-dashboard',
    loadComponent: () => import('./pages/maitre-dashboard/maitre-dashboard.component').then((m)=> m.MaitreDashboardComponent),
  },
  { 
    path: '', 
    redirectTo: 'splash', 
    pathMatch: 'full'
  },
];