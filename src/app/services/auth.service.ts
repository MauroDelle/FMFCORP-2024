import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  email: string;
  password: string;
  type: 'cliente' | 'empleado' | 'supervisor' | 'dueño' | 'dueno';
  nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Inicializar usuarios de prueba si no existen
    if (!localStorage.getItem(this.USERS_KEY)) {
      const defaultUsers: User[] = [
        { email: 'cliente@yopmail.com', password: 'cliente123', type: 'cliente', nombre: 'Cliente test' },
        { email: 'empleado@yopmail.com', password: 'empleado123', type: 'empleado', nombre: 'Empleado test' },
        { email: 'supervisor@yopmail.com', password: 'super123', type: 'supervisor', nombre: 'Supervisor test' },
        { email: 'dueno@yopmail.com', password: 'dueno123', type: 'dueno' || 'dueño', nombre: 'Dueño test' }
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
    }

    // Recuperar sesión si existe
    const savedUser = localStorage.getItem(this.CURRENT_USER_KEY);
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): boolean {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const user = users.find((u: User) => 
      u.email === email && u.password === password
    );
    
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}