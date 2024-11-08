import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { AuthService } from './app/services/auth.service';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { environment } from './environments/environment.prod';
import { provideHttpClient } from '@angular/common/http';
import { getStorage, provideStorage } from '@angular/fire/storage';


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
    provideHttpClient(),
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp({"projectId":"relevamiento-visual1-pps","appId":"1:879394204092:web:747990fe2a1d4620dce3b9","storageBucket":"relevamiento-visual1-pps.appspot.com","apiKey":"AIzaSyD0D0hBDUAopqoUmPflWS4ZKU4e8fwBDAM","authDomain":"relevamiento-visual1-pps.firebaseapp.com","messagingSenderId":"879394204092"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage()),
    AuthService,
  ]
});
