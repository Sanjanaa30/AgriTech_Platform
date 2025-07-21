import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CropCardComponent } from '../../components/crop-card/crop-card.component';
import { FieldSectionCardComponent } from '../../components/field-section-card/field-section-card.component';
import { CropService } from '../../services/crop.service';

interface FieldImage {
  image: string;
  title: string;
  date: string;
  status: string;
  statusColor: string;
}

@Component({
  selector: 'app-farmer-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    CropCardComponent,
    FieldSectionCardComponent
  ],
  templateUrl: './farmer-section.component.html',
  styleUrls: ['./farmer-section.component.css']
})
export class FarmerSectionComponent implements OnInit {
  section: string = '';
  showAddCropModal = false;
  showUploadModal = false;
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

  clearImage(): void {
    this.selectedImageFile = null;
    this.imagePreview = null;
  }

  closeAddCropModal(): void {
    this.showAddCropModal = false;
    this.resetForm();
  }

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

  newFieldImage: FieldImage = {
    image: '',
    title: '',
    date: '',
    status: '',
    statusColor: ''
  };

  fieldFilterStatus = '';
  filteredFieldImages: FieldImage[] = [];

  fieldImages: FieldImage[] = [
    {
      image: 'https://via.placeholder.com/400x250.png?text=Rice+Field',
      title: 'Rice Field - East Zone',
      date: '2025-07-16',
      status: 'Healthy',
      statusColor: 'bg-green-600'
    },
    {
      image: 'https://via.placeholder.com/400x250.png?text=Maize+Patch',
      title: 'Maize Patch - South',
      date: '2025-07-15',
      status: 'Weeds Detected',
      statusColor: 'bg-red-600'
    },
    {
      image: 'https://via.placeholder.com/400x250.png?text=Wheat+Field',
      title: 'Wheat Field - North',
      date: '2025-07-14',
      status: 'Irrigation Needed',
      statusColor: 'bg-yellow-500'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cropService: CropService
  ) {
    this.section = this.route.snapshot.paramMap.get('section') || '';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.section = params.get('section') || 'my-crops';
    });

    this.http.get<any[]>('/assets/data/crop_data.json').subscribe((data) => {
      this.cropData = data;
      this.categories = data.map(c => c.CATEGORY);
    });

    this.cropService.getCrops().subscribe({
      next: (crops) => this.crops = crops,
      error: (err) => console.error('Error loading crops:', err.message)
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

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveNewCrop() {
    if (!this.newCrop.name || !this.newCrop.sowingDate || !this.newCrop.harvestDate || !this.newCrop.status) {
      alert('Please fill all required fields.');
      return;
    }

    if (this.selectedImageFile) {
      const formData = new FormData();
      formData.append('image', this.selectedImageFile);

      this.http.post<{ imageUrl: string }>('http://localhost:5000/api/uploads/crop-image', formData, {
        withCredentials: true
      }).subscribe({
        next: (res) => this.submitCropWithImage(res.imageUrl),
        error: (err) => {
          console.error('Image upload failed:', err.message);
          alert('Image upload failed. Please try again.');
        }
      });
    } else {
      this.submitCropWithImage();
    }
  }

  submitCropWithImage(imageUrl?: string) {
    const cropToAdd = {
      ...this.newCrop,
      imageUrl: imageUrl || 'https://via.placeholder.com/150',
      timeSinceSowed: this.getTimeSinceSowed(this.newCrop.sowingDate)
    };

    this.cropService.addCrop(cropToAdd).subscribe({
      next: (savedCrop) => {
        this.crops.unshift(savedCrop);
        this.resetForm();
        this.showAddCropModal = false;
      },
      error: (err) => {
        console.error('Failed to save crop:', err.message);
        alert('Error saving crop. Please try again.');
      }
    });
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
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.isDragOver = false;
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
      this.cropService.deleteCrop(crop._id).subscribe({
        next: () => {
          this.crops = this.crops.filter(c => c._id !== crop._id);
        },
        error: (err) => {
          console.error('Failed to delete crop:', err.message);
        }
      });
    }
  }

  updateCropStatus(crop: any) {
    alert('Update status for: ' + crop.name);
  }

  viewMoreDetails(crop: any) {
    alert('Show details for: ' + crop.name);
  }

  saveFieldImage() {
    this.fieldImages.push({
      ...this.newFieldImage,
      statusColor: this.getStatusColor(this.newFieldImage.status),
    });
    this.showUploadModal = false;
    this.filterFieldImages();
    this.newFieldImage = { image: '', title: '', date: '', status: '', statusColor: '' };
  }

  filterFieldImages() {
    this.filteredFieldImages = this.fieldFilterStatus
      ? this.fieldImages.filter(f => f.status === this.fieldFilterStatus)
      : this.fieldImages;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Healthy': return 'bg-green-600';
      case 'Weeds Detected': return 'bg-red-600';
      case 'Irrigation Needed': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }

  deleteFieldImage(fieldToDelete: FieldImage) {
    this.fieldImages = this.fieldImages.filter(f => f !== fieldToDelete);
    this.filterFieldImages();
  }

  viewFieldImage(field: FieldImage) {
    alert(`Viewing: ${field.title}`);
  }
}