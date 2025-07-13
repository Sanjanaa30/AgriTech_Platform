import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-farmer-overview',
  templateUrl: './farmer-overview.component.html',
  styleUrls: ['./farmer-overview.component.css']
})
export class FarmerOverviewComponent implements OnInit {

  username: string = 'Farmer'; // Replace with real value from auth service if needed

  // Dummy values (replace later with real API calls)
  cropsCount: number = 5;
  cropTypesCount: number = 3;

  constructor() {}

  ngOnInit(): void {
    // Here you can fetch real user details or counts if needed
  }

  toggleMobileMenu(): void {
    // You can implement a real sidebar toggle if needed
    console.log('Mobile menu toggled');
  }

}
