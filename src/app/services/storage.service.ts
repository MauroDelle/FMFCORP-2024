import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  storageRef = firebase.app().storage().ref();
  
  async subirImagen(carpeta: string, nombre: string, imgBase64: any) {
    try {
      let respuesta = await this.storageRef.child(`${carpeta}/${nombre}`).putString(imgBase64, 'data_url');
      console.log(respuesta);
      return respuesta.ref.getDownloadURL();
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async uploadImages(carpeta: string, nombre: string,file:any){
    let ubicacion = `${carpeta}/${nombre}`; //le digo la ubicacion de la foto en el firebaseStorage
    const imgRef = ref(this.storageRef,ubicacion)
    
    return await uploadBytes(imgRef,file).then(async()=>{
      return await getDownloadURL(imgRef)
        .then( async (imgUrl) => {
          return imgUrl;
       });
    })
  }

  async obtenerImagen(carpeta:string, nombreImg: string) {
    try {
      const url = await this.storageRef.child(carpeta +"/"+ nombreImg).getDownloadURL();
      return url;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}