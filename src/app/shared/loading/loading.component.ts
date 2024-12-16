import { Component } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent {

  openModal() {
    const modalElement = document.getElementById('exampleModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  closeModal() {
    const modalElement = document.getElementById('exampleModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  }
}
