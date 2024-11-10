import { Component, inject, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
  IonIcon, IonMenu, IonMenuButton, IonList, IonItem, IonLabel, 
  IonCard, IonCardHeader, IonCardTitle,
  AlertController, Platform 
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, personCircleOutline, homeOutline, menuOutline, 
  statsChartOutline, peopleOutline, restaurantOutline,
  calendarOutline, clipboardOutline, timeOutline, listOutline,
  barChartOutline, gridOutline, settingsOutline } from 'ionicons/icons';
import { DatabaseService } from '../services/database.service';
import { CommonModule } from '@angular/common';
import { FcmService } from '../services/fcm.service';
import { Subscription } from 'rxjs';

interface UserProfile {
  email: string;
  uid: string;
  perfil?: string;
  nombre?: string;
  type?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit, OnDestroy {
  currentUser: UserProfile | null = null;
  isSupported = false;
  informacionQr: string | null = null;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private database: DatabaseService,
    private alertController: AlertController,
    private platform: Platform,
    private fcm: FcmService
  ) {
    addIcons({personCircleOutline,restaurantOutline,calendarOutline,clipboardOutline,listOutline,timeOutline,peopleOutline,barChartOutline,gridOutline,statsChartOutline,settingsOutline,logOutOutline,homeOutline,menuOutline});
  }

  async ngOnInit() {
    await this.platform.ready();
    
    // Subscribe to auth state changes
    this.authSubscription = this.authService.afAuth.authState.subscribe(async (user) => {
      if (user) {
        try {
          // Get additional user data from database
          let userData = await this.database.obtenerUsuarioPorEmail(user.email!);
          if(userData == null || userData == undefined){
            userData = await this.database.obtenerClientePorEmail(user.email!);
          }
          
          this.currentUser = {
            email: user.email!,
            uid: user.uid,
            perfil: userData?.perfil?.toLowerCase(),
            nombre: userData?.nombre,
            type: userData?.perfil?.toLowerCase() // For compatibility with your existing code
          };

          console.log('Current user:', this.currentUser);

          // Initialize push notifications if we have a user
          if (this.currentUser.uid) {
            await this.fcm.initPush(this.currentUser.uid);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        this.currentUser = null;
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  getUserTypeTitle(): string {
    if (!this.currentUser?.type) return 'Usuario';
    
    switch (this.currentUser.type.toLowerCase()) {
      case 'cliente': return 'Cliente';
      case 'empleado': return 'Empleado';
      case 'supervisor': return 'Supervisor';
      case 'dueño':
      case 'dueno': return 'Dueño';
      default: return 'Usuario';
    }
  }

  handleLogout() {
    this.authService.logout();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permiso denegado',
      message: 'Por favor, otorgue permiso de cámara para usar el escáner QR.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  mesa() {
    const navigationExtras = {
      queryParams: { dato: "8" }
    };
    this.router.navigate(['qr-mesa'], navigationExtras);
  }

  scan(){}
  

  isAdminUser() {
    const userType = this.currentUser?.type;
    return userType === 'dueño' || userType === 'dueno' || userType === 'supervisor';
  }

  navigateToClientManagement() {
    if (this.isAdminUser()) {
      this.router.navigate(['/gestion-clientes']);
    }
  }
}