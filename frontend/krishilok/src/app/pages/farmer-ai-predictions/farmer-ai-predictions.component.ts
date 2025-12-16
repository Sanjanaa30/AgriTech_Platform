import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-farmer-ai-predictions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">AI Predictions</h1>
      
      <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 text-center">
        <svg class="mx-auto h-24 w-24 text-green-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">AI-Powered Insights Coming Soon</h2>
        <p class="text-gray-600 max-w-2xl mx-auto mb-6">
          Get AI predictions for crop yield, disease detection, weather forecasting, market price predictions, and personalized farming recommendations.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="text-3xl mb-2">🌾</div>
            <h3 class="font-semibold text-gray-900">Yield Prediction</h3>
            <p class="text-sm text-gray-600 mt-1">Estimate crop yields based on historical data</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="text-3xl mb-2">🔬</div>
            <h3 class="font-semibold text-gray-900">Disease Detection</h3>
            <p class="text-sm text-gray-600 mt-1">Identify crop diseases using AI image analysis</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="text-3xl mb-2">📈</div>
            <h3 class="font-semibold text-gray-900">Price Forecast</h3>
            <p class="text-sm text-gray-600 mt-1">Predict market prices for better planning</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FarmerAiPredictionsComponent {}
