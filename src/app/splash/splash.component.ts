import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from "@ionic/angular/standalone";
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  imports: [IonContent],
  providers: [AuthService],
  standalone: true
})
export class SplashComponent{

  constructor(private router: Router) {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000); 
   }
}
