import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.css']
})
export class SidebarMenuComponent {
   baseUrl = environment.baseUrl;

  isExpanded = false;
  dropdowns = {
    auth: false,
    multi: false
  };

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  toggleDropdown(menu: keyof typeof this.dropdowns) {
    this.dropdowns[menu] = !this.dropdowns[menu];
  }

  logout() {
    // Redirigir a la página de login usando la URL base del entorno
    window.location.href = `${this.baseUrl}/login`;
  }
}
