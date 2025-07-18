import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CropCardComponent } from '../../components/crop-card/crop-card.component';

@Component({
  selector: 'app-farmer-section',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CropCardComponent],
  templateUrl: './farmer-section.component.html',
  styleUrls: ['./farmer-section.component.css']
})
export class FarmerSectionComponent implements OnInit {
  section: string = '';
  showAddCropModal = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.section = this.route.snapshot.paramMap.get('section') || '';
  }

  cropData: any[] = [];
  categories: string[] = [];
  cropOptions: any[] = [];
  varietyOptions: string[] = [];
  seasonBadge: string = '';

  newCrop: any = {
    name: '',
    category: '',
    season: '',
    variety: '',
    sowingDate: '',
    harvestDate: '',
    imageUrl: '',
    status: '',
    area: '',
    irrigationType: '',
    lastActivity: '',
    notes: '',
    aiHealthScore: 82,
    isListed: true,
    timeSinceSowed: 0,
    notesHistory: []
  };

  filterStatus = '';
  sortBy = '';

  crops: any[] = [
    {
      name: 'Wheat',
      category: 'Cereals',
      type: 'Durum',
      sowingDate: '2024-03-01',
      harvestDate: '2024-08-15',
      status: 'Growing',
      imageUrl: 'https://yourcdn.com/wheat.jpg',
      area: 2,
      irrigationType: 'Drip',
      lastActivity: 'Fertilizer applied',
      aiHealthScore: 82,
      isListed: true,
      timeSinceSowed: 120,
      notesHistory: ['Fertilizer applied']
    }
  ];

  ngOnInit(): void {
    this.http.get<any[]>('/assets/data/normalized_crops_data_cleaned.json').subscribe((data) => {
      this.cropData = data;
      this.categories = data.map(c => c.CATEGORY);
    });
  }

  onCategoryChange() {
    const selected = this.cropData.find(c => c.CATEGORY === this.newCrop.category);
    this.cropOptions = selected?.CROPS || [];
    this.newCrop.name = '';
    this.varietyOptions = [];
    this.seasonBadge = '';
  }

  onCropChange() {
    const crop = this.cropOptions.find(c => c.NAME === this.newCrop.name);
    this.seasonBadge = crop?.SEASON?.[0] || '';

    if (Array.isArray(crop?.VARIETIES)) {
      this.varietyOptions = crop.VARIETIES;
    } else if (typeof crop?.VARIETIES === 'object') {
      this.varietyOptions = Object.values(crop.VARIETIES).flat() as string[];
    } else {
      this.varietyOptions = [];
    }
  }

  get filteredCrops() {
    let result = [...this.crops];

    if (this.filterStatus) {
      result = result.filter(crop => crop.status === this.filterStatus);
    }

    if (this.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'sowingDate') {
      result.sort((a, b) => new Date(a.sowingDate).getTime() - new Date(b.sowingDate).getTime());
    } else if (this.sortBy === 'harvestDate') {
      result.sort((a, b) => new Date(a.harvestDate).getTime() - new Date(b.harvestDate).getTime());
    }

    return result;
  }

  saveNewCrop() {
    if (!this.newCrop.name || !this.newCrop.sowingDate || !this.newCrop.harvestDate || !this.newCrop.status) {
      alert('Please fill all required fields.');
      return;
    }

    const cropToAdd = {
      name: this.newCrop.name,
      type: this.newCrop.variety || 'N/A',
      category: this.newCrop.category,
      season: this.seasonBadge,
      sowingDate: this.newCrop.sowingDate,
      harvestDate: this.newCrop.harvestDate,
      imageUrl: this.newCrop.imageUrl || 'https://via.placeholder.com/150',
      status: this.newCrop.status,
      area: this.newCrop.area || 0,
      irrigationType: this.newCrop.irrigationType || 'N/A',
      lastActivity: this.newCrop.lastActivity || 'No recent activity',
      notesHistory: this.newCrop.notes ? [this.newCrop.notes] : [],
      aiHealthScore: 82,
      isListed: true,
      timeSinceSowed: this.getTimeSinceSowed(this.newCrop.sowingDate)
    };

    this.crops.push(cropToAdd);
    this.resetForm();
    this.showAddCropModal = false;
  }

  resetForm() {
    this.newCrop = {
      name: '',
      category: '',
      season: '',
      variety: '',
      sowingDate: '',
      harvestDate: '',
      imageUrl: '',
      status: '',
      area: '',
      irrigationType: '',
      lastActivity: '',
      notes: '',
      aiHealthScore: 82,
      isListed: true,
      timeSinceSowed: 0,
      notesHistory: []
    };
    this.cropOptions = [];
    this.varietyOptions = [];
    this.seasonBadge = '';
  }

  getTimeSinceSowed(dateStr: string): number {
    const sowingDate = new Date(dateStr);
    const today = new Date();
    const diff = today.getTime() - sowingDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
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
