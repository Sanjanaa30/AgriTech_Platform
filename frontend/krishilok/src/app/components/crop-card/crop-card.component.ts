import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Add this
@Component({
  selector: 'app-crop-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crop-card.component.html',
  styleUrls: ['./crop-card.component.css']
})
export class CropCardComponent {
  @Input() crop: any;

  @Output() edit = new EventEmitter<any>();
  @Output() statusUpdate = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  // 🌟 UI-only modal toggle for "More Details"
  showDetailsModal = false;

  toggleDetailsModal(): void {
    this.showDetailsModal = !this.showDetailsModal;
  }

  onEdit(): void {
    this.edit.emit(this.crop);
  }

  onStatusUpdate(): void {
    this.statusUpdate.emit(this.crop);
  }

  onDelete(): void {
    this.delete.emit(this.crop);
  }

  onViewMore(): void {
    this.toggleDetailsModal(); // ✅ clean toggle
  }
  getTimeSinceSowed(): number {
    if (!this.crop?.sowingDate) return 0;
    const sowingDate = new Date(this.crop.sowingDate);
    const today = new Date();
    const diffTime = today.getTime() - sowingDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  newNote: string = '';

  addNote() {
    if (this.newNote.trim()) {
      const dateStr = new Date().toLocaleDateString(); // e.g., 18/07/2025
      const formattedNote = `${this.newNote.trim()} (on ${dateStr})`;

      this.crop.notesHistory = this.crop.notesHistory || [];
      this.crop.notesHistory.unshift(formattedNote);

      this.crop.lastActivity = formattedNote; // ✅ update with timestamped note
      this.newNote = '';
    }
  }

}
