import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-farmer-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './farmer-orders.component.html',
  styleUrls: ['./farmer-orders.component.css']
})
export class FarmerOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  filterStatus = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.http.get<any>('http://localhost:5000/api/orders/farmer', { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.orders = response.orders || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          this.loading = false;
        }
      });
  }

  get filteredOrders(): any[] {
    if (this.filterStatus === 'all') {
      return this.orders;
    }
    return this.orders.filter(o => o.status.toLowerCase() === this.filterStatus);
  }

  updateOrderStatus(order: any, newStatus: string): void {
    this.http.put(`http://localhost:5000/api/orders/${order._id}/status`, 
      { status: newStatus }, 
      { withCredentials: true }
    ).subscribe({
      next: () => {
        order.status = newStatus;
        alert('Order status updated successfully!');
      },
      error: (err) => {
        console.error('Error updating order:', err);
        alert('Failed to update order status');
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }
}
