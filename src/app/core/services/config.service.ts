import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private configUrl = 'assets/js/config.js';  // Ruta del archivo de configuración
  // private configUrl = 'cine-butacas/assets/js/config.js';
  private configSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  loadConfig(): void {
    this.http.get<any>(this.configUrl).subscribe(
      (data) => {
        this.configSubject.next(data);  // Actualiza el valor de la configuración
      },
      (error) => {
        console.error('Error al cargar la configuración:', error);
      }
    );
  }

  // Propiedad para obtener el Observable
  get configValue$() {
    return this.configSubject.asObservable();  // Devuelve el Observable de configuración
  }
}
