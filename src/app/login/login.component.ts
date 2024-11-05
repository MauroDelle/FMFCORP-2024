import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonInput, 
         IonButton, IonIcon, IonSegment, IonSegmentButton, IonButtons, IonFab, 
         IonFabButton, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonButtons,
    IonFab,
    IonFabButton
  ]
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  userType: string = 'cliente';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  async handleLogin() {
    // Validar campos vacíos
    if (!this.credentials.email || !this.credentials.password) {
      await this.presentToast('Por favor complete todos los campos', 'warning');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.credentials.email)) {
      await this.presentToast('Por favor ingrese un email válido', 'warning');
      return;
    }

    if (this.authService.login(this.credentials.email, this.credentials.password)) {
      await this.presentToast('¡Bienvenido!', 'success');
      this.router.navigate(['/home']);
    } else {
      await this.presentToast('Credenciales inválidas', 'danger');
    }
  }

  async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }

  setTestUser(type: string) {
    switch(type) {
      case 'cliente':
        this.credentials = {
          email: 'cliente@yopmail.com',
          password: 'cliente123'
        };
        this.userType = 'cliente';
        break;
      case 'empleado':
        this.credentials = {
          email: 'empleado@yopmail.com',
          password: 'empleado123'
        };
        this.userType = 'empleado';
        break;
      case 'supervisor':
        this.credentials = {
          email: 'supervisor@yopmail.com',
          password: 'super123'
        };
        this.userType = 'supervisor';
        break;
      case 'dueño':
      case 'dueno':
        this.credentials = {
          email: 'dueno@yopmail.com',
          password: 'dueno123'
        };
        this.userType = 'dueño';
        break;
    }
  }
}