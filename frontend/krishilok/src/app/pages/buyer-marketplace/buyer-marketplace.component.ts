import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Crop {
  _id: string;
  name: string;
  category: string;
  variety: string;
  season: string;
  area: number;
  imageUrl: string;
  farmerName: string;
  farmerLocation: string;
  farmerContact: string;
  status: string;
}

@Component({
  selector: 'app-buyer-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buyer-marketplace.component.html',
  styleUrls: ['./buyer-marketplace.component.css']
})
export class BuyerMarketplaceComponent implements OnInit {
  crops: Crop[] = [];
  filteredCrops: Crop[] = [];
  loading = true;
  searchTerm = '';
  selectedCategory = '';
  selectedSeason = '';

  categories = ['Cereals', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds'];
  seasons = ['Kharif', 'Rabi', 'Zaid', 'Perennial'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMarketplaceCrops();
  }

  loadMarketplaceCrops(): void {
    this.loading = true;
    this.http.get<Crop[]>('http://localhost:5000/api/marketplace/crops', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.crops = data;
          this.filteredCrops = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading marketplace crops:', err);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredCrops = this.crops.filter(crop => {
      const matchesSearch = !this.searchTerm || 
        crop.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        crop.variety.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || crop.category === this.selectedCategory;
      const matchesSeason = !this.selectedSeason || crop.season === this.selectedSeason;

      return matchesSearch && matchesCategory && matchesSeason;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedSeason = '';
    this.filteredCrops = this.crops;
  }

  contactFarmer(crop: Crop): void {
    alert(`Contact: ${crop.farmerName}\nPhone: ${crop.farmerContact}\nLocation: ${crop.farmerLocation}`);
  }

  placeOrder(crop: Crop): void {
    const quantity = prompt('Enter quantity (in kg):');
    if (quantity && !isNaN(Number(quantity))) {
      const orderData = {
        cropId: crop._id,
        quantity: Number(quantity),
        deliveryAddress: 'User Address', // Should come from user profile
        contactNumber: '+919999999999', // Should come from user profile
        notes: ''
      };

      this.http.post('http://localhost:5000/api/orders', orderData, { withCredentials: true })
        .subscribe({
          next: (res: any) => {
            alert(`Order placed successfully! Order ID: ${res.order.orderId}`);
          },
          error: (err) => {
            alert('Failed to place order. Please try again.');
            console.error('Order error:', err);
          }
        });
    }
  }
}
