import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-farmer-expert-replies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Expert Replies</h1>
      
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 text-center">
        <svg class="mx-auto h-24 w-24 text-green-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Connect with Agricultural Experts</h2>
        <p class="text-gray-600 max-w-2xl mx-auto mb-6">
          Get answers to your farming questions from certified agricultural experts. Ask about crop diseases, pest control, soil health, irrigation techniques, and more.
        </p>
        <button class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
          Ask an Expert
        </button>
        
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-lg">👨‍🌾</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">Dr. Rajesh Kumar</p>
                <p class="text-sm text-gray-600">Soil Health Specialist</p>
                <p class="text-xs text-green-600 mt-1">Available</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-lg">👩‍🌾</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">Dr. Priya Sharma</p>
                <p class="text-sm text-gray-600">Crop Disease Expert</p>
                <p class="text-xs text-gray-500 mt-1">Offline</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FarmerExpertRepliesComponent {}
