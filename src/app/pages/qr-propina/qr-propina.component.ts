import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IonToolbar, IonHeader, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonFooter } from "@ionic/angular/standalone";
import { GoBackToolbarComponent } from 'src/app/shared/components/go-back-toolbar/go-back-toolbar.component';

@Component({
  selector: 'app-qr-propina',
  templateUrl: './qr-propina.component.html',
  styleUrls: ['./qr-propina.component.scss'],
  standalone: true,
  imports: [CommonModule, 
    GoBackToolbarComponent, 
    IonFooter, 
    IonButton, 
    IonCardContent, 
    IonCardTitle, 
    IonCardHeader, 
    IonCard, 
    IonContent, 
    IonToolbar, ]
})
export class QrPropinaComponent  implements OnInit {

  nivelSatisfaccionSeleccionado: number | null = null;
  totalCuenta: number | null = null;
  propinaCalculada: number | null = null;
  totalConPropinaCalculada: number | null = 0;

  constructor(private router: Router, private activatedRouter: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRouter.queryParams.subscribe(params => {
      if (params['dato']) {
        this.totalCuenta = parseInt(params['dato'], 10); // Convertir a número
      }
    });
  }

  seleccionarNivel(nivel: number): void {
    this.nivelSatisfaccionSeleccionado = nivel;
    this.calcularPropina();
  }

  calcularPropina(): void {
    if (this.totalCuenta !== null && this.nivelSatisfaccionSeleccionado !== null) {
      this.propinaCalculada = (this.totalCuenta * this.nivelSatisfaccionSeleccionado) / 100;
      this.totalConPropinaCalculada = this.totalCuenta + this.propinaCalculada;
    } else {
      this.propinaCalculada = null;
      this.totalConPropinaCalculada = null;
    }
  }

  enviarPropina(): void {
    if (this.totalCuenta && this.nivelSatisfaccionSeleccionado !== null && this.propinaCalculada !== null && this.totalConPropinaCalculada !== null) {
      console.log('Propina enviada:', this.propinaCalculada);
      console.log('Total con propina:', this.totalConPropinaCalculada);

      const navigationExtras: NavigationExtras = {
        queryParams: { dato: this.propinaCalculada.toString() }
      };

      this.router.navigate(['pedir-cuenta'], navigationExtras);
    } else {
      console.error('Por favor, ingrese el total de la cuenta y seleccione un nivel de satisfacción.');
    }
  }
}
