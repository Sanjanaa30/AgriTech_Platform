import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true, // ✅ MUST ADD
  imports: [CommonModule, FormsModule], // ✅ INCLUDE FOR ngModel
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  showPassword = false;

  formData = {
    firstName: '',
    lastName: '',
    mobile: '',
    aadhar: '',
    email: '',
    password: '',
    role: '',
    district: '',
    state: ''
  };

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Form submitted:', this.formData);
    // 🔗 Call backend service to register here
  }
}
