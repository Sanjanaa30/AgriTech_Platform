import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-buyer-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buyer-overview.component.html',
  styleUrls: ['./buyer-overview.component.css']
})
export class BuyerOverviewComponent implements OnInit {
  username: string = 'Buyer';
  ordersCount: number = 0;
  pendingOrders: number = 0;
  deliveredOrders: number = 0;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBuyerData();
  }

  loadBuyerData(): void {
    this.http.get<any[]>('http://localhost:5000/api/orders/buyer', { withCredentials: true })
      .subscribe({
        next: (orders) => {
          this.ordersCount = orders.length;
          this.pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
          this.deliveredOrders = orders.filter(o => o.status === 'delivered').length;
        },
        error: (err) => {
          console.error('Error loading buyer data:', err);
        }
      });
  }

  navigateTo(path: string): void {
    this.router.navigate(['/buyer-dashboard', path]);
  }
}
