import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // ✅ Import this

@Component({
  selector: 'app-farmer-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './farmer-section.component.html'
})
export class FarmerSectionComponent {
  section: string = '';

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.section = params['section'];
    });
  }

  crops = [
    { name: 'Tomato', type: 'Vegetable', sowingDate: '2024-06-10', status: 'Sown' },
    { name: 'Wheat', type: 'Cereal', sowingDate: '2024-05-15', status: 'Harvested' },
    { name: 'Chili', type: 'Vegetable', sowingDate: '2024-06-01', status: 'Sown' }
  ];

  get uniqueCropTypes() {
    const types = this.crops.map(c => c.type);
    return new Set(types).size;
  }

  get sownCrops() {
    return this.crops.filter(c => c.status.toLowerCase() === 'sown').length;
  }

  openAddCropModal() {
    alert('This would open a modal to add a new crop (not implemented yet).');
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

}
