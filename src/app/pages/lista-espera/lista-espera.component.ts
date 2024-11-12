import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { Cliente } from 'src/app/clases/cliente';
import { NotificationService } from 'src/app/services/notification.service';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
  IonIcon, IonMenu, IonMenuButton, IonList, IonItem, IonLabel, 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonAvatar,
  AlertController, Platform, IonBackButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { EmailService } from 'src/app/services/email.service';

@Component({
  selector: 'app-lista-espera',
  templateUrl: './lista-espera.component.html',
  styleUrls: ['./lista-espera.component.scss'],
  standalone: true,
  imports: [    CommonModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardTitle,
    IonAvatar,
  ],
})
export class ListaEsperaComponent  implements OnInit {


  public arrayListaEspera: Array<any> = [];
  public arrayClientes: Array<any> = [];
  public arrayShow: Array<any> = [];

  constructor(private database: DatabaseService) {}

  ngOnInit() {
    this.cargarClientesEnEspera();
    this.cargarClientes();
  }

  cargarClientes() {
    this.database.obtenerTodos('clientes')!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(next => {
      this.arrayClientes = next;
      this.actualizarArrayShow();
      console.log("Clientes observables:", this.arrayClientes);
    });
  }

  cargarClientesEnEspera() {
    this.database.obtenerTodos('lista-espera')!.pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(next => {
      this.arrayListaEspera = next.filter(cliente => cliente.estado === "pendiente");
      this.actualizarArrayShow();
      console.log("Lista de espera observables:", this.arrayListaEspera);
    });
  }

  actualizarArrayShow() {
    this.arrayShow = [];
    this.arrayListaEspera.forEach(clienteEnEspera => {
      const cliente = this.arrayClientes.find(c => c.uid === clienteEnEspera.idCliente);
      if (cliente) {
        this.arrayShow.push(cliente);
      } else {
        this.arrayShow.push({ urlFoto: '', nombre: 'Usuario', apellido: 'anónimo' });
      }
    });
    console.log("Clientes pendientes en arrayShow:", this.arrayShow);
  }

}
