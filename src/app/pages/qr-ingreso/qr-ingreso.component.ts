import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonIcon, IonCol, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, IonText, IonAlert, IonSpinner, IonGrid, IonRow, IonFab, IonFabButton, IonCardSubtitle, IonAvatar, IonBackButton, IonButtons, IonMenu, IonMenuButton, IonList } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, map } from 'rxjs';
import Swal from 'sweetalert2';
import { NotificationService } from 'src/app/services/notification.service';
import { GoBackToolbarComponent } from 'src/app/shared/components/go-back-toolbar/go-back-toolbar.component';

@Component({
  selector: 'app-qr-ingreso',
  templateUrl: './qr-ingreso.component.html',
  styleUrls: ['./qr-ingreso.component.scss'],
  standalone: true,
  imports: [    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    GoBackToolbarComponent,
    ],
})
export class QrIngresoComponent  implements OnInit {

  private uidUsuarioActual : string = '';
  private email : string = '';
  private arrayListaEspera : Array<any> = [];
  private docEnLista : any = null;

  constructor(private router: Router, private database: DatabaseService, private auth: AngularFireAuth, private notificationService: NotificationService) { }

  ngOnInit() {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.uidUsuarioActual = user.uid;
        this.email = user.email!;
        console.log('User UID:', this.uidUsuarioActual);
      } else {
        console.log('No user is logged in');
      }
    });

    const listaEsperaObs : Observable<any[]> = this.database.obtenerTodos('lista-espera')!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );

    listaEsperaObs.subscribe(data => {
      this.arrayListaEspera = data;
      for (let obj of this.arrayListaEspera) {
        console.log(obj);
        if (obj.idCliente == this.uidUsuarioActual) {
          this.docEnLista = obj;
          break;
        }
      }
    });

  }

  async agregarListaEspera() {
    if (this.uidUsuarioActual != '') {

      if (this.docEnLista != null) {
      //Si está en la lista de espera y su estado es 'finalizado', actualizo la lista de espera, sino informo al cliente
        switch (this.docEnLista.estado) {
          case 'finalizado':
            const listaEsperaActualizada = {
              estado: 'pendiente',
              idCliente: this.uidUsuarioActual,
              email: this.email
            };
            await this.database.actualizar("lista-espera", listaEsperaActualizada, this.docEnLista.id);
            this.enviarNotificacion();
            Swal.fire({
              title: 'Éxito',
              text: 'Usted fue añadido a la Lista de Espera. Pronto se le asignará una mesa',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: 'var(--ion-color-primary)',
              heightAuto: false
            });
            break;
          case 'pendiente':
            Swal.fire({
              title: 'Usted ya se encuentra en la Lista de Espera',
              text: 'Por favor aguarde a ser asignado a una mesa.',
              icon: 'info',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: 'var(--ion-color-primary)',
              heightAuto: false
            });
            break;
          case 'asignado':
            Swal.fire({
              title: 'Error',
              text: 'Ya tiene una mesa asignada, debe escanear el QR de la misma.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: 'var(--ion-color-primary)',
              heightAuto: false
            });
            break;
        }
      } else {
        // Si no se encuentra en la lista de espera, lo agrego.
        const ingresoListaEspera = {
          estado: 'pendiente',
          idCliente: this.uidUsuarioActual,
          email: this.email
        }

        await this.database.crear("lista-espera", ingresoListaEspera);
        this.enviarNotificacion();
        Swal.fire({
          title: 'Éxito',
          text: 'Usted fue añadido a la Lista de Espera. Pronto se le asignará una mesa',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: 'var(--ion-color-primary)',
          heightAuto: false
        });
      }
    } else {
      Swal.fire({
        title: 'Error',
        text: `No se pudo verificar la sesión actual`,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: 'var(--ion-color-primary)',
        heightAuto: false
      });
    }
  }
  
  enviarNotificacion() {
    this.notificationService.sendNotificationToRole(
      'Hay nuevos clientes en la lista espera!',
      'Estan a la espera de tomar una mesa...',
      'Metre'
    ).subscribe(
      response => console.log('Notificación a Metre enviada con éxito', response),
      error => console.error('Error al enviar notificación a Metre', error)
    );
  }

  redireccionar(path : string) {
    this.router.navigateByUrl(path);
  }


}
