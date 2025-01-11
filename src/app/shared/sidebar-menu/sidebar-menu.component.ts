import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment} from '../../environment/environment';

import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.css']
})
export class SidebarMenuComponent {

  isExpanded = false;
  dropdowns = {
    auth: false,
    multi: false
  };



  constructor(
    private router: Router
  ) { }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  toggleDropdown(menu: keyof typeof this.dropdowns) {
    this.dropdowns[menu] = !this.dropdowns[menu];
  }

  home() {
    // Redirigir directamente a la URL externa
    window.location.href = 'http://gestion.jiiff.com/cine-butacas/dashboard';
    // this.router.navigate([`${environment.baseUrl}/cine-butacas/dashboard`]);

  }
  
  logout() {
    // Redirigir directamente a la URL externa
    // window.location.href = 'http://gestion.jiiff.com/cine-butacas/login';
    this.router.navigate([`${environment.baseUrl}/cine-butacas/login`]);
  }

}


// http://gestion.jiiff.com/login
// 
// http://gestion.jiiff.com/home