import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Order {
  orderId: string;
  cropName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  orderDate: string;
  farmerName: string;
  farmerContact: string;
  deliveryAddress: string;
}

@Component({
  selector: 'app-buyer-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buyer-orders.component.html',
  styleUrls: ['./buyer-orders.component.css']
})
export class BuyerOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  selectedStatus = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.http.get<Order[]>('http://localhost:5000/api/orders/buyer', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.orders = data;
          this.filteredOrders = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          this.loading = false;
        }
      });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    if (status === '') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(o => o.status === status);
    }
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.http.patch(`http://localhost:5000/api/orders/${orderId}/status`, 
        { status: 'cancelled' }, 
        { withCredentials: true })
        .subscribe({
          next: () => {
            alert('Order cancelled successfully');
            this.loadOrders();
          },
          error: (err) => {
            alert('Failed to cancel order');
            console.error('Error cancelling order:', err);
          }
        });
    }
  }

  trackOrder(order: Order): void {
    alert(`Order Status: ${order.status}\nOrder ID: ${order.orderId}\nFarmer: ${order.farmerName}\nContact: ${order.farmerContact}`);
  }
}
