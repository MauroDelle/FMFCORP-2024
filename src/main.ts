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


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
    provideHttpClient(),
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)), provideFirebaseApp(() => initializeApp({"projectId":"fmfcorp-2024","appId":"1:840951034886:web:379469070cb7cd83d97f87","storageBucket":"fmfcorp-2024.firebasestorage.app","apiKey":"AIzaSyBlrdSM53jysbRqtamk49KGfNOQinGoaEk","authDomain":"fmfcorp-2024.firebaseapp.com","messagingSenderId":"840951034886"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()), provideFirebaseApp(() => initializeApp({"projectId":"fmfcorp-2024","appId":"1:840951034886:web:379469070cb7cd83d97f87","storageBucket":"fmfcorp-2024.firebasestorage.app","apiKey":"AIzaSyBlrdSM53jysbRqtamk49KGfNOQinGoaEk","authDomain":"fmfcorp-2024.firebaseapp.com","messagingSenderId":"840951034886"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()), 
    AuthService
  ],
});
