import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldSectionCardComponent } from '../../components/field-section-card/field-section-card.component';

interface FieldImage {
  image: string;
  title: string;
  date: string;
  status: string;
  statusColor: string;
}

@Component({
  selector: 'app-farmer-field-images',
  standalone: true,
  imports: [CommonModule, FieldSectionCardComponent],
  templateUrl: './farmer-field-images.component.html',
  styleUrls: ['./farmer-field-images.component.css']
})
export class FarmerFieldImagesComponent implements OnInit {
  fieldImages: FieldImage[] = [];

  ngOnInit(): void {
    this.loadFieldImages();
  }

  loadFieldImages(): void {
    // Mock data - replace with actual API call
    this.fieldImages = [
      {
        image: '/assets/field1.jpg',
        title: 'North Field Section',
        date: new Date().toISOString(),
        status: 'Healthy',
        statusColor: 'green'
      },
      {
        image: '/assets/field2.jpg',
        title: 'South Field Section',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'Needs Attention',
        statusColor: 'yellow'
      }
    ];
  }

  viewFieldImage(image: FieldImage): void {
    alert(`Viewing: ${image.title}`);
    // Implement full image view
  }

  deleteFieldImage(image: FieldImage): void {
    if (confirm(`Delete ${image.title}?`)) {
      this.fieldImages = this.fieldImages.filter(img => img !== image);
      alert('Image deleted');
    }
  }
}
