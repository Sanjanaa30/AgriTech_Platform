import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Notification {
  _id: string;
  type: 'order' | 'system' | 'promotion';
  title: string;
  message: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-buyer-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buyer-notifications.component.html',
  styleUrls: ['./buyer-notifications.component.css']
})
export class BuyerNotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  filterType: 'all' | 'order' | 'system' | 'promotion' = 'all';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    // For now, using mock data. In production, this should be an API call
    setTimeout(() => {
      this.notifications = this.getMockNotifications();
      this.loading = false;
    }, 500);
  }

  getMockNotifications(): Notification[] {
    return [
      {
        _id: '1',
        type: 'order',
        title: 'Order Confirmed',
        message: 'Your order #ORD-001 has been confirmed by the farmer.',
        orderId: 'ORD-001',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '2',
        type: 'order',
        title: 'Order Shipped',
        message: 'Your order #ORD-002 has been shipped and is on the way.',
        orderId: 'ORD-002',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '3',
        type: 'system',
        title: 'Welcome to Krishilok!',
        message: 'Thank you for registering as a buyer. Start exploring fresh crops from local farmers.',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '4',
        type: 'promotion',
        title: 'Special Offer',
        message: 'Get 10% off on your first 5 orders. Use code: WELCOME10',
        isRead: true,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '5',
        type: 'order',
        title: 'Order Delivered',
        message: 'Your order #ORD-003 has been delivered successfully.',
        orderId: 'ORD-003',
        isRead: true,
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  get filteredNotifications(): Notification[] {
    if (this.filterType === 'all') {
      return this.notifications;
    }
    return this.notifications.filter(n => n.type === this.filterType);
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  markAsRead(notification: Notification): void {
    notification.isRead = true;
    // In production, make API call to update notification status
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    // In production, make API call to mark all as read
  }

  deleteNotification(id: string): void {
    const confirmed = confirm('Delete this notification?');
    if (confirmed) {
      this.notifications = this.notifications.filter(n => n._id !== id);
      // In production, make API call to delete notification
    }
  }

  viewOrder(orderId: string): void {
    this.router.navigate(['/buyer-dashboard/orders'], { 
      queryParams: { orderId } 
    });
  }

  clearAllNotifications(): void {
    const confirmed = confirm('Clear all notifications? This action cannot be undone.');
    if (confirmed) {
      this.notifications = [];
      // In production, make API call to clear notifications
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'order':
        return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';
      case 'system':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'promotion':
        return 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z';
      default:
        return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'order':
        return 'text-blue-500';
      case 'system':
        return 'text-gray-500';
      case 'promotion':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  }
}
