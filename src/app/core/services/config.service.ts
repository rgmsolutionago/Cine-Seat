import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private configUrl = 'assets/js/config.json';  // URL del archivo de configuración
  // private configUrl = 'cine-butacas/assets/js/config.js';
  private configSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  loadConfig(): void {
    console.log('Intentando cargar el archivo de configuración desde:', this.configUrl); // Log para verificar la URL

    this.http.get<any>(this.configUrl).subscribe(
      (data) => {
        console.log('Configuración cargada con éxito:', data);  // Log de los datos recibidos
        this.configSubject.next(data);  // Actualiza el valor de la configuración
      },
      (error) => {
        console.error('Error al cargar la configuración:', error);  // Log de error
        // Agregar más detalles sobre el error si es posible
        if (error.status) {
          console.error('Código de error:', error.status);
          console.error('Texto del error:', error.statusText);
        }
        console.error('Detalles del error:', error);
      }
    );
  }

  // Propiedad para obtener el Observable
  get configValue$() {
    return this.configSubject.asObservable();  // Devuelve el Observable de configuración
  }
}
