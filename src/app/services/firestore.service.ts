import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { from, Observable } from 'rxjs';
import { Firestore, addDoc, collection, collectionData, doc, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';

export const APP_TOKEN = 'app_token';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  save(data: any, path: string) {
    const col = collection(this.firestore, path);
    addDoc(col, data);
  }

  get(path: string) {
    const col = collection(this.firestore, path);
    const observable = collectionData(col);

    return observable;
  }

  async getClienteByDni(dni: any) {
    try {
      const clientesCollection = collection(this.firestore, 'clientes');
  
      const q = query(clientesCollection, where('dni', '==', dni));
  
      const querySnapshot = await getDocs(q);
      const clienteData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return clienteData;
    } catch (error) {
      console.error('Error actualizando el documento: ', error);
      return;
    }
  }

  setStorage(key: string, value: any) {
    Preferences.set({key: key, value: value});
  }

  getStorage(key: string): any {
    // Preferences.migrate();
    return Preferences.get({key: key});
  }

  removeStorage(key: string) {
    Preferences.remove({key: key});
  }

  clearStorage() {
    Preferences.clear();
  }

  getToken(): Observable<any> {
    return from(this.getStorage(APP_TOKEN));
  }

}
