import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarMenuComponent } from '../../shared/sidebar-menu/sidebar-menu.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,SidebarMenuComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: []
})

export class LoginComponent {

  username: string = '';
  password: string = '';
  isUserError: boolean = false;
  isPasswordError: boolean = false;
  showError: boolean = false;

  isInitialized: boolean = false;

  onSubmit(event: Event): void {
    event.preventDefault();

    this.isUserError = !this.username.trim();
    this.isPasswordError = !this.password.trim();
    this.showError = this.isUserError || this.isPasswordError;
  }

  resetError(): void {
    this.isUserError = false;
    this.isPasswordError = false;
    this.showError = false;
  }

  LoginVal(){

    this.isInitialized = true;

    this.isUserError = !this.username.trim();
    this.isPasswordError = !this.password.trim();
    this.showError = this.isUserError || this.isPasswordError;

    setTimeout(()=>{
      this.showError = false;
      this.isUserError = false;
      this.isPasswordError = false;
    }, 5000);

    if(!this.showError){
      console.log("valido");
    }
    
  }
}
