import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface WishlistItem {
  _id: string;
  cropId: string;
  cropName: string;
  cropImage: string;
  farmerName: string;
  farmerLocation: string;
  category: string;
  variety: string;
  addedDate: string;
}

@Component({
  selector: 'app-buyer-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buyer-wishlist.component.html',
  styleUrls: ['./buyer-wishlist.component.css']
})
export class BuyerWishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    // For now, using localStorage. In production, this should be an API call
    const wishlist = localStorage.getItem('buyerWishlist');
    if (wishlist) {
      this.wishlistItems = JSON.parse(wishlist);
    }
    this.loading = false;
  }

  removeFromWishlist(cropId: string): void {
    const confirmed = confirm('Remove this item from your wishlist?');
    if (confirmed) {
      this.wishlistItems = this.wishlistItems.filter(item => item.cropId !== cropId);
      localStorage.setItem('buyerWishlist', JSON.stringify(this.wishlistItems));
      alert('Removed from wishlist');
    }
  }

  viewInMarketplace(cropId: string): void {
    this.router.navigate(['/buyer-dashboard/marketplace'], { 
      queryParams: { cropId } 
    });
  }

  placeOrder(item: WishlistItem): void {
    const quantity = prompt('Enter quantity (in kg):');
    if (quantity && !isNaN(Number(quantity))) {
      const orderData = {
        cropId: item.cropId,
        quantity: Number(quantity),
        deliveryAddress: 'User Address',
        contactNumber: '+919999999999',
        notes: ''
      };

      this.http.post('http://localhost:5000/api/orders', orderData, { withCredentials: true })
        .subscribe({
          next: (res: any) => {
            alert(`Order placed successfully! Order ID: ${res.order.orderId}`);
            this.router.navigate(['/buyer-dashboard/orders']);
          },
          error: (err) => {
            alert('Failed to place order. Please try again.');
            console.error('Order error:', err);
          }
        });
    }
  }

  clearWishlist(): void {
    const confirmed = confirm('Are you sure you want to clear your entire wishlist?');
    if (confirmed) {
      this.wishlistItems = [];
      localStorage.removeItem('buyerWishlist');
      alert('Wishlist cleared');
    }
  }
}
