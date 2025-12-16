import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CropCardComponent } from '../../components/crop-card/crop-card.component';
import { CropService } from '../../services/crop.service';

@Component({
  selector: 'app-farmer-my-crops',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CropCardComponent],
  templateUrl: './farmer-my-crops.component.html',
  styleUrls: ['./farmer-my-crops.component.css']
})
export class FarmerMyCropsComponent implements OnInit {
  @ViewChild('imageInput') imageInputRef!: ElementRef<HTMLInputElement>;
  
  showAddCropModal = false;
  isEditing = false;
  currentEditingCropId: string | null = null;

  filterStatus = '';
  sortBy = '';
  cropData: any[] = [];
  categories: string[] = [];
  cropOptions: any[] = [];
  varietyOptions: string[] = [];
  seasonBadge: string = '';
  crops: any[] = [];

  selectedImageFile: File | null = null;
  imagePreview: string | null = null;
  isDragOver: boolean = false;
  imageRemoved = false;

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

  constructor(
    private http: HttpClient,
    private cropService: CropService
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>('/assets/data/crop_data.json').subscribe((data) => {
      this.cropData = data;
      this.categories = data.map(c => c.CATEGORY);
    });

    this.loadCrops();
  }

  loadCrops(): void {
    this.cropService.getCrops().subscribe({
      next: (crops) => this.crops = crops,
      error: (err) => console.error('Error loading crops:', err.message)
    });
  }

  get filteredCrops(): any[] {
    let result = [...this.crops];
    if (this.filterStatus) {
      result = result.filter(crop => crop.status === this.filterStatus);
    }
    return this.sortCrops(result);
  }

  sortCrops(crops: any[]): any[] {
    if (this.sortBy === 'name') {
      return crops.sort((a, b) => a.name?.localeCompare(b.name));
    } else if (this.sortBy === 'sowingDate') {
      return crops.sort((a, b) => new Date(a.sowingDate).getTime() - new Date(b.sowingDate).getTime());
    } else if (this.sortBy === 'harvestDate') {
      return crops.sort((a, b) => new Date(a.harvestDate).getTime() - new Date(b.harvestDate).getTime());
    }
    return crops;
  }

  openAddCropModal(): void {
    this.showAddCropModal = true;
    this.isEditing = false;
    this.currentEditingCropId = null;
    this.imageRemoved = false;
    this.resetForm();
  }

  closeAddCropModal(): void {
    this.showAddCropModal = false;
    this.resetForm();
  }

  resetForm(): void {
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
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.seasonBadge = '';
  }

  onCategoryChange(): void {
    const selected = this.cropData.find(c => c.CATEGORY === this.newCrop.category);
    this.cropOptions = selected?.CROPS || [];
    this.newCrop.name = '';
    this.varietyOptions = [];
    this.seasonBadge = '';
  }

  onCropChange(): void {
    const crop = this.cropOptions.find(c => c.NAME === this.newCrop.name);

    if (crop?.SEASON?.length) {
      this.seasonBadge = crop.SEASON[0];
      this.newCrop.season = crop.SEASON[0];
    }

    if (Array.isArray(crop?.VARIETIES)) {
      this.varietyOptions = crop.VARIETIES;
    } else if (typeof crop?.VARIETIES === 'object') {
      this.varietyOptions = Object.values(crop.VARIETIES).flat() as string[];
    } else {
      this.varietyOptions = [];
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
      this.imageRemoved = false;
    }
  }

  removeImage(): void {
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.imageRemoved = true;
    if (this.imageInputRef?.nativeElement) {
      this.imageInputRef.nativeElement.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      const file = files[0];
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveCrop(): Promise<void> {
    if (!this.newCrop.name || !this.newCrop.category) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(this.newCrop).forEach(key => {
        formData.append(key, this.newCrop[key]);
      });

      if (this.selectedImageFile) {
        formData.append('image', this.selectedImageFile);
      }

      if (this.isEditing && this.currentEditingCropId) {
        formData.append('_id', this.currentEditingCropId);
        if (this.imageRemoved) {
          formData.append('removeImage', 'true');
        }
      }

      const url = this.isEditing && this.currentEditingCropId
        ? `http://localhost:5000/api/crops/${this.currentEditingCropId}`
        : 'http://localhost:5000/api/crops';

      const method = this.isEditing ? 'put' : 'post';

      this.http.request(method, url, {
        body: formData,
        withCredentials: true
      }).subscribe({
        next: () => {
          alert(this.isEditing ? 'Crop updated successfully!' : 'Crop added successfully!');
          this.closeAddCropModal();
          this.loadCrops();
        },
        error: (err) => {
          alert('Failed to save crop');
          console.error('Save error:', err);
        }
      });
    } catch (err) {
      console.error('Error saving crop:', err);
      alert('Failed to save crop');
    }
  }

  editCrop(crop: any): void {
    this.isEditing = true;
    this.currentEditingCropId = crop._id;
    this.newCrop = { ...crop };
    this.imagePreview = crop.imageUrl || null;
    this.showAddCropModal = true;
  }

  deleteCrop(cropId: string): void {
    if (confirm('Are you sure you want to delete this crop?')) {
      this.cropService.deleteCrop(cropId).subscribe({
        next: () => {
          alert('Crop deleted successfully!');
          this.loadCrops();
        },
        error: (err) => {
          alert('Failed to delete crop');
          console.error('Delete error:', err);
        }
      });
    }
  }
}
