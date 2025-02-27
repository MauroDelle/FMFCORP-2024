import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardTitle, IonRow, IonCol, IonButton, IonCardSubtitle, IonFooter, AlertController } from "@ionic/angular/standalone";
import { DatabaseService } from 'src/app/services/database.service';
import { Observable, map } from 'rxjs';
import Swal from 'sweetalert2';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { GoBackToolbarComponent } from 'src/app/shared/components/go-back-toolbar/go-back-toolbar.component';


@Component({
  selector: 'app-pedir-cuenta',
  templateUrl: './pedir-cuenta.component.html',
  styleUrls: ['./pedir-cuenta.component.scss'],
  standalone: true,
  imports: [CommonModule,IonFooter, GoBackToolbarComponent, IonCardSubtitle, IonButton, IonCol, IonRow, IonCardTitle, IonCard, IonContent, IonTitle, IonToolbar, IonHeader, ]
})
export class PedirCuentaComponent  implements OnInit {

  listaPedidos: any[] = [];
  pedidoActual: any = null;
  idUsuarioActual: any;
  preciosUnitarios: any[] = [];
  isSupported = false;
  barcodes: Barcode[] = [];
  informacionQr: string | null = null;
  totalConPropina: any | null = null;
  descuento: number | null = null;
  descuentoNumero: number | null = null;
  mostrarJuego: boolean = false;
  totalConDescuento: number | null = null;
  propina: number | null = null;
  usuarioEnLista: any = null;
  subtotal: number = 0;

  constructor(
    private afAuth: AngularFireAuth,
    private database: DatabaseService,
    private router: Router,
    private alertController: AlertController,
    private activatedRouter: ActivatedRoute
  ) { }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.idUsuarioActual = user.uid;
        this.cargarPedidos();
        this.cargarListaEspera();
      }
    });
    this.activatedRouter.queryParams.subscribe(params => {
      this.propina = parseInt(params['dato']);
      this.calcularSubtotal();
    });
  }

  calcularSubtotal() {
    const total = this.pedidoActual.montoTotal;
    const propina = this.propina || 0;
    const descuento = this.descuento ? (total * this.descuento / 100) : 0;
    this.descuentoNumero = descuento;
    this.subtotal = total + propina - descuento;
  }

  recibirDatos(datos: any) {
    this.descuento = parseInt(datos);
    if (this.descuento != null) {
      this.mostrarJuego = false;
    }
    this.calcularSubtotal();
  }

  cargarPedidos() {
    const pedidosObs: Observable<any[]> = this.database.obtenerTodos('pedidos')!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );

    pedidosObs.subscribe(data => {
      this.listaPedidos = data;
      for (let item of this.listaPedidos) {
        if (item.idCliente === this.idUsuarioActual && item.estado === "entregado-confirmado") {
          this.pedidoActual = item;
          this.preciosUnitarios = item.preciosUnitarios;
          this.calcularSubtotal();
          break;
        }
      }
    });
  }

  cargarListaEspera() {
    const listaEsperaObs: Observable<any[]> = this.database.obtenerTodos('lista-espera')!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );

    listaEsperaObs.subscribe(data => {
      let arrayResults = data;
      for (let doc of arrayResults) {
        if (doc.idCliente == this.idUsuarioActual && doc.estado === "asignado") {
          this.usuarioEnLista = doc;
          break;
        }
      }
    });
  }

  async actualizarLista() {
    const listaEsperaActualizada = {
      estado: 'finalizado',
      idCliente: this.usuarioEnLista.idCliente,
      email: this.usuarioEnLista.email
    };

    await this.database.actualizar("lista-espera", listaEsperaActualizada, this.usuarioEnLista.id)
    .then(() => console.log("Estado lista-espera actualizado"))
    .catch((error) => console.log(error));
  }


  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async scan(): Promise<void> {
    const { barcodes } = await BarcodeScanner.scan();
    if (barcodes.length > 0) {
      this.informacionQr = barcodes[0].rawValue;
    }
    this.barcodes.push(...barcodes);

    const navigationExtras: NavigationExtras = {
      queryParams: { dato: parseInt(this.pedidoActual.montoTotal) }
    };

    this.router.navigate(['qr-' + this.informacionQr!], navigationExtras);
  }

  ir() {
    const navigationExtras: NavigationExtras = {
      queryParams: { dato: parseInt(this.pedidoActual.montoTotal) }
    };

    this.router.navigate(['qr-propina'], navigationExtras);
  }

  realizarPago() {
    this.actualizarLista();
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: '¡Se ha realizado el pago!',
      heightAuto: false,
      showConfirmButton: false,
      timer: 1500
    });
  }
}
