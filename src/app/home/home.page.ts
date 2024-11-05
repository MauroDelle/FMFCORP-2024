import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
         IonIcon, IonMenu, IonMenuButton, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { AuthService, User } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { logOutOutline, personCircleOutline, homeOutline, menuOutline, 
         statsChartOutline, peopleOutline, restaurantOutline } from 'ionicons/icons';

interface MenuItem {
  id: number;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class HomePage implements OnInit {
  currentUser: User | null = null;

  duenoMenuItems: MenuItem[] = [
    { id: 1, label: 'Dashboard', icon: 'stats-chart-outline', route: '/dashboard' },
    { id: 2, label: 'Gestión de Personal', icon: 'people-outline', route: '/personal' },
    { id: 3, label: 'Gestión de Mesas', icon: 'restaurant-outline', route: '/mesas' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ 
      logOutOutline, 
      personCircleOutline, 
      homeOutline, 
      menuOutline,
      statsChartOutline,
      peopleOutline,
      restaurantOutline
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserTypeTitle(): string {
    if (!this.currentUser) return 'Home';
    
    switch(this.currentUser.type) {
      case 'cliente':
        return 'Panel de Cliente';
      case 'empleado':
        return 'Panel de Empleado';
      case 'supervisor':
        return 'Panel de Supervisor';
      case 'dueño':
      case 'dueno':
        return 'Panel de Dueño';
      default:
        return 'Home';
    }
  }
}