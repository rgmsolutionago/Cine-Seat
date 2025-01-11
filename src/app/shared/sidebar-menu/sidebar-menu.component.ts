import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../environment/environment';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ConfigService } from '../../core/services/config.service';  // Asegúrate de tener la ruta correcta para el servicio
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.css']
})
export class SidebarMenuComponent {
  config: any;

  isExpanded = false;
  dropdowns = {
    auth: false,
    multi: false
  };

  constructor(private router: Router, private configService: ConfigService) { }

  ngOnInit() {
    // Usar configValue$ directamente
    this.configService.configValue$.subscribe((data) => {
      this.config = data;
      console.log(this.config);  // Accede a la configuración cargada
    });
  }


  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  toggleDropdown(menu: keyof typeof this.dropdowns) {
    this.dropdowns[menu] = !this.dropdowns[menu];
  }

  home() {
    // Redirigir directamente a la URL externa
    window.location.href = 'http://gestion.jiiff.com/cine-butacas/home';
  }
  
  logout() {
    // Redirigir directamente a la URL externa
    // window.location.href = 'http://gestion.jiiff.com/cine-butacas/login';
     this.router.navigate([`${this.config.baseUrl}/dashboard`]);
  }

}
