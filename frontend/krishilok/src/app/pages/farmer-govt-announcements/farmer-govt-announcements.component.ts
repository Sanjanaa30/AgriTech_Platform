import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Announcement {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-farmer-govt-announcements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './farmer-govt-announcements.component.html',
  styleUrls: ['./farmer-govt-announcements.component.css']
})
export class FarmerGovtAnnouncementsComponent {
  announcements: Announcement[] = [
    {
      id: 1,
      title: 'PM-KISAN Scheme - 16th Installment Released',
      description: 'The 16th installment of ₹2000 has been released to eligible farmers. Check your bank account for the credit.',
      date: new Date().toISOString(),
      category: 'Subsidy',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Kisan Credit Card - Interest Subvention Extended',
      description: 'The interest subvention scheme for KCC has been extended till March 2026. Farmers can avail short-term loans at 4% interest.',
      date: new Date(Date.now() - 86400000).toISOString(),
      category: 'Finance',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Soil Health Card Distribution',
      description: 'District agriculture office will distribute Soil Health Cards from 20th-25th December. Visit your nearest Krishi Vigyan Kendra.',
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      category: 'Services',
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Weather Alert: Heavy Rainfall Expected',
      description: 'IMD predicts heavy rainfall in the region from 18th-20th December. Take necessary precautions for standing crops.',
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      category: 'Weather',
      priority: 'high'
    }
  ];

  getPriorityColor(priority: string): string {
    const colors: any = {
      'high': 'bg-red-100 text-red-800 border-red-300',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'low': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[priority] || colors['low'];
  }

  getPriorityIcon(priority: string): string {
    const icons: any = {
      'high': '🔴',
      'medium': '🟡',
      'low': '🔵'
    };
    return icons[priority] || icons['low'];
  }
}
