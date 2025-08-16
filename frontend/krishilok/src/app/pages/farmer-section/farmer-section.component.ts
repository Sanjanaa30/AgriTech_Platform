import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CropCardComponent } from '../../components/crop-card/crop-card.component';
import { FieldSectionCardComponent } from '../../components/field-section-card/field-section-card.component';
import { CropService } from '../../services/crop.service';
import { ViewChild, ElementRef } from '@angular/core';

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
  @ViewChild('imageInput') imageInputRef!: ElementRef<HTMLInputElement>;
  section: string = '';
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
  imageRemoved = false

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

  openAddCropModal() {
    this.showAddCropModal = true;
    this.isEditing = false;
    this.currentEditingCropId = null;
    this.imageRemoved = false;   // ✅
    this.resetForm();
  }
  closeAddCropModal(): void {
    this.showAddCropModal = false;
    this.resetForm();
  }

  clearImage(): void {
    this.selectedImageFile = null;
    this.imagePreview = null;
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

  // onImageSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   const file = input?.files?.[0];
  //   if (file) {
  //     this.selectedImageFile = file;  // ✅ This is the missing line
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.imagePreview = reader.result as string;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

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

  // saveNewCrop() {
  //   console.log('Saving new crop...');
  //   console.log('Selected file:', this.selectedImageFile);

  //   if (!this.newCrop.name || !this.newCrop.sowingDate || !this.newCrop.harvestDate || !this.newCrop.status) {
  //     alert('Please fill all required fields.');
  //     return;
  //   }

  //   if (this.selectedImageFile) {
  //     const formData = new FormData();
  //     formData.append('image', this.selectedImageFile);

  //     console.log('Uploading image to server...');

  //     this.http.post<{ imageUrl: string }>('http://localhost:5000/api/uploads/crop-image', formData, {
  //       withCredentials: true
  //     }).subscribe({
  //       next: (res) => {
  //         console.log('Image upload success:', res);
  //         this.submitCropWithImage(res.imageUrl);
  //       },
  //       error: (err) => {
  //         console.error('Image upload failed:', err.message);
  //         alert('Image upload failed. Please try again.');
  //       }
  //     });
  //   } else {
  //     console.warn('No image selected, skipping upload.');
  //     this.submitCropWithImage();
  //   }
  // }

  saveNewCrop() {
    if (!this.newCrop.name || !this.newCrop.sowingDate || !this.newCrop.harvestDate || !this.newCrop.status) {
      alert('Please fill all required fields.');
      return;
    }

    const isAdding = !this.isEditing;

    // Case: file selected → upload first
    if (this.selectedImageFile) {
      const formData = new FormData();
      formData.append('image', this.selectedImageFile);

      this.http.post<{ imageUrl: string }>('http://localhost:5000/api/uploads/crop-image', formData, {
        withCredentials: true
      }).subscribe({
        next: (res) => {
          console.log('✅ Image upload success:', res);
          this.submitCropWithImage(res.imageUrl); // Use uploaded URL
        },
        error: (err) => {
          console.error('❌ Image upload failed:', err.message);
          alert('Image upload failed. Please try again.');
        }
      });
    } else {
      // No new file selected
      if (isAdding) {
        // Add new crop → placeholder if no image
        this.submitCropWithImage('https://via.placeholder.com/150');
      } else {
        // Edit crop → keep old image OR blank if removed
        this.submitCropWithImage();
      }
    }
  }



  // submitCropWithImage(imageUrl?: string) {
  //   const updatedCrop = {
  //     ...this.newCrop,
  //     season: this.seasonBadge || this.newCrop.season,
  //     imageUrl: imageUrl || this.newCrop.imageUrl || 'https://via.placeholder.com/150',
  //     timeSinceSowed: this.getTimeSinceSowed(this.newCrop.sowingDate)
  //   };

  //   if (this.isEditing && this.currentEditingCropId) {
  //     this.cropService.updateCrop(this.currentEditingCropId, updatedCrop).subscribe({
  //       next: (updated) => {
  //         const index = this.crops.findIndex(c => c._id === this.currentEditingCropId);
  //         if (index !== -1) this.crops[index] = updated;
  //         this.closeAddCropModal();
  //       },
  //       error: (err) => {
  //         console.error('Error updating crop:', err.message);
  //         alert('Failed to update crop.');
  //       }
  //     });
  //   } else {
  //     this.cropService.addCrop(updatedCrop).subscribe({
  //       next: (savedCrop) => {
  //         this.crops.unshift(savedCrop);
  //         this.closeAddCropModal();
  //       },
  //       error: (err) => {
  //         console.error('Failed to save crop:', err.message);
  //         alert('Error saving crop. Please try again.');
  //       }
  //     });
  //   }
  // }

  submitCropWithImage(imageUrl?: string) {
    const isAdding = !this.isEditing;
    let finalImageUrl: string;

    if (this.imageRemoved) {
      // User explicitly removed
      finalImageUrl = '';
    } else if (imageUrl) {
      // Just uploaded a new file
      finalImageUrl = imageUrl;
    } else if (isAdding) {
      // Add without image → placeholder
      finalImageUrl = 'https://via.placeholder.com/150';
    } else {
      // Edit without touching image → keep old
      finalImageUrl = this.newCrop.imageUrl;
    }

    const updatedCrop = {
      ...this.newCrop,
      season: this.seasonBadge || this.newCrop.season,
      imageUrl: finalImageUrl,
      timeSinceSowed: this.getTimeSinceSowed(this.newCrop.sowingDate)
    };

    if (this.isEditing && this.currentEditingCropId) {
      this.cropService.updateCrop(this.currentEditingCropId, updatedCrop).subscribe({
        next: (updated) => {
          const i = this.crops.findIndex(c => c._id === this.currentEditingCropId);
          if (i !== -1) this.crops[i] = updated;
          this.closeAddCropModal();
        },
        error: (err) => {
          console.error('Error updating crop:', err.message);
          alert('Failed to update crop.');
        }
      });
    } else {
      this.cropService.addCrop(updatedCrop).subscribe({
        next: (savedCrop) => {
          this.crops.unshift(savedCrop);
          this.closeAddCropModal();
        },
        error: (err) => {
          console.error('Failed to save crop:', err.message);
          alert('Error saving crop. Please try again.');
        }
      });
    }
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
    this.currentEditingCropId = null;
  }

  getTimeSinceSowed(dateStr: string): number {
    const sowingDate = new Date(dateStr);
    const today = new Date();
    const diff = today.getTime() - sowingDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  editCrop(crop: any) {
    this.isEditing = true;
    this.currentEditingCropId = crop._id;
    this.newCrop = { ...crop };
    this.imageRemoved = false

    const selectedCategory = this.cropData.find(c => c.CATEGORY === crop.category);
    this.cropOptions = selectedCategory?.CROPS || [];

    const selectedCrop = this.cropOptions.find(c => c.NAME === crop.name);
    this.seasonBadge = crop.season;

    if (Array.isArray(selectedCrop?.VARIETIES)) {
      this.varietyOptions = selectedCrop.VARIETIES;
    } else if (typeof selectedCrop?.VARIETIES === 'object') {
      this.varietyOptions = Object.values(selectedCrop.VARIETIES).flat() as string[];
    } else {
      this.varietyOptions = [];
    }

    this.imagePreview = crop.imageUrl;
    this.showAddCropModal = true;
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

  // removeImage(): void {
  //   this.selectedImageFile = null;
  //   this.imagePreview = null;

  //   // Remove from newCrop object
  //   this.newCrop.imageUrl = '';

  //   // If editing existing crop, tell backend to remove image
  //   if (this.isEditing && this.currentEditingCropId) {
  //     this.cropService.removeCropImage(this.currentEditingCropId).subscribe({
  //       next: () => {
  //         console.log('✅ Image removed from backend');
  //       },
  //       error: (err) => {
  //         console.error('❌ Failed to remove image:', err.message);
  //       }
  //     });
  //   }
  // }

  removeImage(): void {
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.newCrop.imageUrl = ''; // Mark for blank on save
    this.imageRemoved = true
    // Reset file input so picking the same file works
    if (this.imageInputRef?.nativeElement) {
      this.imageInputRef.nativeElement.value = '';
    }
  }



  // FIELD IMAGES SECTION
  fieldImages: FieldImage[] = [
    {
      image: 'https://via.placeholder.com/400x250.png?text=Field+1',
      title: 'Rice Field - North',
      date: '2025-07-01',
      status: 'Healthy',
      statusColor: 'bg-green-600'
    },
    {
      image: 'https://via.placeholder.com/400x250.png?text=Field+2',
      title: 'Maize Patch - South',
      date: '2025-07-02',
      status: 'Weeds Detected',
      statusColor: 'bg-red-600'
    }
  ];

  viewFieldImage(field: FieldImage) {
    alert(`Viewing: ${field.title}`);
  }

  deleteFieldImage(fieldToDelete: FieldImage) {
    this.fieldImages = this.fieldImages.filter(f => f !== fieldToDelete);
  }
}
