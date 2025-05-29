import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import stateDistrictData from '../../../assets/states-districts.json';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
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

  states: string[] = [];
  districts: string[] = [];

  ngOnInit() {
    this.states = Object.keys(stateDistrictData);
  }

onStateChange(state: string) {
  this.formData.district = '';
  this.districts = (stateDistrictData as any)[state] || [];
}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Form submitted:', this.formData);
  }
}
