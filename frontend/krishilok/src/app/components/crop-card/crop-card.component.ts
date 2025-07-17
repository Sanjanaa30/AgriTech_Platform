import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crop-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crop-card.component.html',
  styleUrls: ['./crop-card.component.css']
})
export class CropCardComponent {
  @Input() crop: any;

  @Output() edit = new EventEmitter<any>();
  @Output() statusUpdate = new EventEmitter<any>();
  @Output() viewMore = new EventEmitter<any>(); // 🔁 You can keep this if backend triggers needed later
  @Output() delete = new EventEmitter<any>();

  // 🌟 UI-only modal toggle for "More Details"
  showDetails = false;

  onEdit() {
    this.edit.emit(this.crop);
  }

  onStatusUpdate() {
    this.statusUpdate.emit(this.crop);
  }

  // ✅ Show modal for now (UI only)
  onViewMore() {
    this.showDetails = true;
    // this.viewMore.emit(this.crop); // ❌ disable this if modal is standalone
  }

  onDelete() {
    this.delete.emit(this.crop);
  }
}
