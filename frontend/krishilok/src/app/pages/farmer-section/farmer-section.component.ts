import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CropCardComponent } from '../../components/crop-card/crop-card.component';

@Component({
  selector: 'app-farmer-section',
  standalone: true,
  imports: [CommonModule, FormsModule, CropCardComponent],
  templateUrl: './farmer-section.component.html',
  styleUrls: ['./farmer-section.component.css']
})
export class FarmerSectionComponent {
  section: string = '';

  constructor(private route: ActivatedRoute) {
    this.section = this.route.snapshot.paramMap.get('section') || '';
  }
  showAddCropModal = false;

  newCrop = {
    name: '',
    variety: '',
    sowingDate: '',
    harvestDate: '',
    imageUrl: '',
    status: '',
    area: '',
    irrigationType: '',
    lastActivity: '',
    notes: ''
  };

  // Filter/Sort controls
  filterStatus = '';
  sortBy = '';

  // Dummy crops with additional fields
  crops = [
    {
      name: 'Wheat',
      type: 'Durum',
      sowingDate: '2024-03-01',
      harvestDate: '2024-08-15',
      status: 'Growing',
      imageUrl: 'https://yourcdn.com/wheat.jpg'
    },
    {
      name: 'Maize',
      type: 'Dent',
      sowingDate: '2024-04-01',
      harvestDate: '2024-09-10',
      status: 'Growing',
      imageUrl: 'https://yourcdn.com/maize.jpg'
    },
    {
      name: 'Tornatoes',
      type: 'Roma',
      sowingDate: '2024-02-20',
      harvestDate: '2024-07-30',
      status: 'Ready for Market',
      imageUrl: 'https://yourcdn.com/tomatoes.jpg'
    }
  ];

  // Computed crop list
  get filteredCrops() {
    let result = [...this.crops];

    // Filter by status
    if (this.filterStatus) {
      result = result.filter(crop => crop.status === this.filterStatus);
    }

    // Sort logic
    if (this.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'sowingDate') {
      result.sort((a, b) => new Date(a.sowingDate).getTime() - new Date(b.sowingDate).getTime());
    } else if (this.sortBy === 'harvestDate') {
      result.sort((a, b) => new Date(a.harvestDate).getTime() - new Date(b.harvestDate).getTime());
    }

    return result;
  }

  // Placeholder actions
  openAddCropModal() {
    alert('Open Add Crop modal (UI only)');
  }

  editCrop(crop: any) {
    alert('Edit crop: ' + crop.name);
  }

  deleteCrop(crop: any) {
    const confirmDelete = confirm(`Are you sure you want to delete ${crop.name}?`);
    if (confirmDelete) {
      this.crops = this.crops.filter(c => c !== crop);
    }
  }

  updateCropStatus(crop: any) {
    alert('Update status for: ' + crop.name);
  }

  viewMoreDetails(crop: any) {
    alert('Show details for: ' + crop.name);
  }
}
