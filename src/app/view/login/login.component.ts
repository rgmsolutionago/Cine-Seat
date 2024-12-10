import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('0.3s ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  isUserError: boolean = false;
  isPasswordError: boolean = false;
  showError: boolean = false;

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
}
