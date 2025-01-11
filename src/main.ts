import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { ConfigService } from './app/core/services/config.service';
import { HttpClientModule } from '@angular/common/http'; // Importa el módulo

import { provideHttpClient } from '@angular/common/http'; // Esto también es necesario para la inyección de HTTP en Standalone Components.


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),provideHttpClient(), // Asegúrate de agregar esto  // Para las rutas
    ConfigService,           // Proveer el servicio de configuración
    { provide: 'app.config', useValue: appConfig }  // Proveer la configuración en 'app.config'
  ]
}).catch(err => console.error(err));