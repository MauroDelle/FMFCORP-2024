import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  imports: [IonContent],
  standalone: true
})
export class SplashComponent{

  constructor(private router: Router) {
    // setTimeout(() => {
    //   this.router.navigate(["login"]);
    // },4000)
   }
}
