import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private aceptacionTemplate='template_pae4m49';
  private rechazoTemplate='template_utgtnok';
  constructor() { }

  //TemplateId type  number, hace referencia al template a enviar aceptacion (1) o rechazo (0)
  async enviarCorreo(email: string, templateIdParam: number) {
    const templateParams = {
      to_email: email,
    };
  
    try {
      console.log("PARAM templateId",templateIdParam);
      
      let templateId= templateIdParam == 1 ? this.aceptacionTemplate : this.rechazoTemplate;

      console.log("templateId",templateId);
      const response = await emailjs.send(
        'service_srskugj',
        templateId,
        templateParams,
        'J2iRvJBoAhgEsX8gO'
      );

      console.log('Correo enviado con éxito:', response);
    } catch (error) {
      console.error('Error al enviar el correo:', error);
    }
  }
}
