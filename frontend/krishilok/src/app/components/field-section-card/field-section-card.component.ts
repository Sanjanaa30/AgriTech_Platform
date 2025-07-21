import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-field-section-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-section-card.component.html',
  styleUrls: ['./field-section-card.component.css']
})
export class FieldSectionCardComponent {
  @Input() fieldImages: any[] = [];

  @Output() view = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  onView(field: any) {
    this.view.emit(field);
  }

  onDelete(field: any) {
    this.delete.emit(field);
  }

  onUploadImage() {
    console.log('Upload Image Clicked');
  }
}
