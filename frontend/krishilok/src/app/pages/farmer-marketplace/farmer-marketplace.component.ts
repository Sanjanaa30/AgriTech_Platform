import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-farmer-marketplace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './farmer-marketplace.component.html',
  styleUrls: ['./farmer-marketplace.component.css']
})
export class FarmerMarketplaceComponent implements OnInit {
  listedCrops: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadListedCrops();
  }

  loadListedCrops(): void {
    this.loading = true;
    this.http.get<any[]>('http://localhost:5000/api/crops', { withCredentials: true })
      .subscribe({
        next: (crops) => {
          this.listedCrops = crops.filter(c => c.isListed);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading crops:', err);
          this.loading = false;
        }
      });
  }

  toggleListing(crop: any): void {
    const newStatus = !crop.isListed;
    this.http.put(`http://localhost:5000/api/crops/${crop._id}`, 
      { ...crop, isListed: newStatus }, 
      { withCredentials: true }
    ).subscribe({
      next: () => {
        crop.isListed = newStatus;
        alert(`Crop ${newStatus ? 'listed' : 'unlisted'} successfully!`);
      },
      error: (err) => {
        console.error('Error updating crop:', err);
        alert('Failed to update listing status');
      }
    });
  }
}
