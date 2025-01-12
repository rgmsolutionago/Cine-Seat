import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarMenuComponent } from '../../shared/sidebar-menu/sidebar-menu.component';
import { SoapClientService } from '../../core/services/soap-client.service';
import { environment } from '../../environment/environment';

import { Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ConfigService } from '../../core/services/config.service';  // Asegúrate de tener la ruta correcta para el servicio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarMenuComponent,HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: []
})

export class LoginComponent {
  config: any;

  username: string = '';
  password: string = '';
  isUserError: boolean = false;
  isPasswordError: boolean = false;
  showError: boolean = false;

  errorMsg: string = '';

  constructor(private soapClient: SoapClientService, private router: Router,
      private configService: ConfigService) { }

  ngOnInit() {
    // Usar configValue$ directamente
    this.configService.configValue$.subscribe((data) => {
      this.config = data;
      console.log(this.config);  // Accede a la configuración cargada
    });

    localStorage.removeItem('userSession');
  }

  resetError(): void {
    this.isUserError = false;
    this.isPasswordError = false;
    this.showError = false;
  }

  async LoginVal() {

    this.errorMsg = "Error al intentar ingresar";
    this.isUserError = !this.username.trim();
    this.isPasswordError = !this.password.trim();
    this.showError = this.isUserError || this.isPasswordError;

    if (!this.showError) {

      await this.Login();
    }

    setTimeout(() => {
      this.showError = false;
      this.isUserError = false;
      this.isPasswordError = false;
    }, 5000);

  }

  async Login() {
    console.log(`Aqui login 1` + `${this.config.baseUrl}/dashboard`);
    console.log('LoginVal ejecutado'); // Agregar este log para confirmar

    const res = await this.soapClient.getUSer(this.username, this.password);

    if (!res.status) {
      this.errorMsg = res.msg;
      this.showError = true;
      return;
    }

    localStorage.setItem('userSession', JSON.stringify(res.data));
    setTimeout(() => {
      console.log(`Aqui login 2` + `${this.config.baseUrl}/dashboard`); // Agregar este log para confirmar
      // this.router.navigate([`${this.config.baseUrl}/dashboard`]);
      this.router.navigate(['/dashboard']);
  } , 500);

  }
}
