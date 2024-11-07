import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonInput, 
         IonButton, IonIcon, IonSegment, IonSegmentButton, IonButtons, IonFab, 
         IonFabButton, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { ValidatorsService } from '../services/validators.service';
import { TestUser } from '../interface/testUser.Interface';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  providers: [AuthService],
  imports: [
    ReactiveFormsModule,
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
export class LoginComponent implements OnInit {


  public myForm: FormGroup;
  public isLoading: boolean = false;
  public userType: string = 'cliente';
  public showPassword: boolean = false; // Agregar esta propiedad
  constructor(
    private fb: FormBuilder,
    private validatorsService: ValidatorsService,
    private authService: AuthService
  ) {
    this.myForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.validatorsService.emailPattern)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  checkboxSelected: any = null; // Variable para almacenar el checkbox seleccionado

  public testUsers: TestUser[] = [];


  selectCheckbox(user: any) {
    this.checkboxSelected = user; // Asignar el usuario seleccionado a la variable
  }

  ngOnInit(): void {
    this.testUsers = this.authService.testUsers;
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.myForm, field);
  }

  getErrorByField(field: string): string | null {
    return this.validatorsService.getErrorByField(this.myForm, field);
  }

  login(email: string, password: string): void {
    this.isLoading = true;
    this.authService.login(email, password).then(() => {
      this.isLoading = false;
      this.myForm.reset();
    });
  }

  fastLogin(email: string, password: string): void {
    this.myForm.controls['email'].setValue(email);
    this.myForm.controls['password'].setValue(password);
  }

  onSubmit(): void {
    const { email, password } = this.myForm.value;
    this.login(email, password);
  }
}
