import { Component, inject, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
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
  barChartOutline, gridOutline
} from 'ionicons/icons';
import { DatabaseService } from '../services/database.service';
import { CommonModule } from '@angular/common';
import { FcmService } from '../services/fcm.service';
//import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

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
  ]
})
export class HomePage implements OnInit {
  currentUser: any = null;
  isSupported = false;
  //barcodes: Barcode[] = [];
  informacionQr: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private database: DatabaseService,
    private alertController: AlertController,
    private platform: Platform,
    private fcm: FcmService
  ) {
    addIcons({ 
      logOutOutline, personCircleOutline, homeOutline, menuOutline,
      statsChartOutline, peopleOutline, restaurantOutline,
      calendarOutline, clipboardOutline, timeOutline, listOutline,
      barChartOutline, gridOutline
    });

    this.platform.ready().then(() => {
      this.currentUser = this.authService.loggedUser;
      console.log(this.currentUser?.email);
      console.log(this.currentUser?.uid);
      if (this.currentUser?.uid) {
        this.fcm.initPush(this.currentUser.uid);
      }
    }).catch(e => {
      console.error('error fcm: ', e);
    });
  }

  async ngOnInit() {
    await this.loadUserData();
    //await this.initializeBarcodeScanner();
  }
  
  /*
  private async initializeBarcodeScanner() {
    const { supported } = await BarcodeScanner.isSupported();
    this.isSupported = supported;
    
    if (this.isSupported) {
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available) {
        try {
          await BarcodeScanner.installGoogleBarcodeScannerModule();
          BarcodeScanner.addListener("googleBarcodeScannerModuleInstallProgress", 
            () => console.log("Instalación finalizada"));
        } catch (err) {
          console.error("Error installing barcode scanner:", err);
        }
      }
    }
  }
  */

  async loadUserData() {
    const loggedUser = this.authService.loggedUser;
    if (loggedUser?.email) {
      try {
        const userData = await this.database.obtenerUsuarioPorEmail(loggedUser.email);
        this.currentUser = {
          ...userData,
          email: loggedUser.email,
          type: userData?.perfil?.toLowerCase() || 'cliente'
        };
      } catch (error) {
        console.error('Error loading user data:', error);
        this.currentUser = {
          nombre: 'Usuario',
          email: loggedUser.email,
          type: 'cliente'
        };
      }
    }
  }

  async scan(): Promise<void> {}
    /*
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }
    
    const { barcodes } = await BarcodeScanner.scan();
    if (barcodes.length > 0) {
      this.informacionQr = barcodes[0].rawValue;
      
      if(this.informacionQr === 'propina' || this.informacionQr === 'ingreso') {
        this.router.navigateByUrl("qr-" + this.informacionQr);
      } else {
        const navigationExtras: NavigationExtras = {
          queryParams: { dato: this.informacionQr }
        };
        this.router.navigate(['qr-mesa'], navigationExtras);
      }
    }
  }
  
  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }
  */

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permiso denegado',
      message: 'Por favor, otorgue permiso de cámara para usar el escáner QR.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async stopScan(): Promise<void> {
    //await BarcodeScanner.stopScan();
  }

  handleLogout() {
    this.authService.logout();
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

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  mesa() {
    const navigationExtras: NavigationExtras = {
      queryParams: { dato: "8" }
    };
    this.router.navigate(['qr-mesa'], navigationExtras);
  }
}