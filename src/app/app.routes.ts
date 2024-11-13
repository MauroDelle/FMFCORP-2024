import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
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
    path: 'vincular-mesa',
    loadComponent: () => import('./pages/vincular-mesa/vincular-mesa.component').then((m)=> m.VincularMesaComponent),
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu.component').then((m)=> m.MenuComponent),
  },
  {
    path: 'lista-espera',
    loadComponent: () => import('./pages/lista-espera/lista-espera.component').then( m => m.ListaEsperaComponent)
  },
  {
    path: 'qr-ingreso',
    loadComponent: () => import('./pages/qr-ingreso/qr-ingreso.component').then( m => m.QrIngresoComponent)
  },
  {
    path: 'pedidos-cocina',
    loadComponent: () => import('./pages/pedidos-pendientes/pedidos-pendientes.component').then( m => m.PedidosPendientesComponent)
  },
  {
    path: 'pedidos-bar',
    loadComponent: () => import('./pages/pedidos-pendientes-barman/pedidos-pendientes-barman.component').then( m => m.PedidosPendientesBarmanComponent)
  },
  {
    path: 'consultar-mozo',
    loadComponent: () => import('./pages/consulta-mozo/consulta-mozo.component').then( m => m.ConsultaMozoComponent)
  },
  {
    path: 'pedidos-por-confirmar-mozo',
    loadComponent: () => import('./pages/pedidos-confirmar-mozo/pedidos-confirmar-mozo.component').then( m => m.PedidosConfirmarMozoComponent)
  },
  {
    path: 'qr-propina',
    loadComponent: () => import('./pages/qr-propina/qr-propina.component').then( m => m.QrPropinaComponent)
  },
  {
    path: 'pedir-cuenta',
    loadComponent: () => import('./pages/pedir-cuenta/pedir-cuenta.component').then( m => m.PedirCuentaComponent)
  },
  { 
    path: '', 
    redirectTo: 'splash', 
    pathMatch: 'full'
  },
];