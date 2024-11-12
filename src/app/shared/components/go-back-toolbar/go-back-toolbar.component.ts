import { Component, OnInit, Input } from '@angular/core';
import { IonToolbar, IonBackButton, IonButtons, IonTitle, IonHeader } from "@ionic/angular/standalone";


@Component({
  selector: 'app-go-back-toolbar',
  templateUrl: './go-back-toolbar.component.html',
  styleUrls: ['./go-back-toolbar.component.scss'],
  standalone: true,
  imports:[
    IonToolbar, IonBackButton, IonButtons, IonTitle , IonHeader 
  ]
})
export class GoBackToolbarComponent  implements OnInit {

  @Input() msj:string = '';
  constructor() { }

  ngOnInit() {}

}
