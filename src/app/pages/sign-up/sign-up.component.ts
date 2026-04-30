import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FirestoreAuthService } from '../../services/firestore-auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />
      
      <main class="px-6 lg:px-12 py-8">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Sign Up</h1>
          <p class="text-gray-500 mb-6">Create your account and find your perfect roommate</p>
          
          <div class="grid lg:grid-cols-12 gap-8">
            
            <!-- Left: Sign Up Form -->
            <div class="lg:col-span-5">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-6">Create Account</h2>
                
                <form class="space-y-5" (ngSubmit)="onSubmit()">
                  <!-- Account Section -->
                  <div class="pb-5 border-b border-gray-100">
                    <h3 class="text-xs font-medium text-primary mb-4 uppercase tracking-wide">Account Info</h3>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                        <input 
                          type="email" 
                          [(ngModel)]="formData.email"
                          name="email"
                          required
                          placeholder="you@example.com"
                          class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
                        <input 
                          type="password" 
                          [(ngModel)]="formData.password"
                          name="password"
                          required
                          minlength="6"
                          placeholder="••••••••"
                          class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                        <p class="text-xs text-gray-400 mt-1">Min 6 characters</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Profile Section -->
                  <div>
                    <h3 class="text-xs font-medium text-primary mb-4 uppercase tracking-wide">Your Profile</h3>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
                        <input 
                          type="text" 
                          [(ngModel)]="formData.name"
                          name="name"
                          required
                          placeholder="Enter your full name"
                          class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-medium text-gray-500 mb-1.5">Age</label>
                          <input 
                            type="number" 
                            [(ngModel)]="formData.age"
                            name="age"
                            required
                            placeholder="22"
                            class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-500 mb-1.5">Occupation</label>
                          <input 
                            type="text" 
                            [(ngModel)]="formData.occupation"
                            name="occupation"
                            required
                            placeholder="Student"
                            class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                        </div>
                      </div>
                      
                      <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1.5">Preferred Area</label>
                        <input 
                          type="text" 
                          [(ngModel)]="formData.preferredArea"
                          name="preferredArea"
                          required
                          placeholder="Hanamkonda / Near Campus"
                          class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                      </div>
                      
                      <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1.5">Monthly Budget</label>
                        <select 
                          [(ngModel)]="formData.budget"
                          name="budget"
                          required
                          class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white">
                          <option value="">Select budget range</option>
                          <option value="₹3,000 - ₹5,000">₹3,000 - ₹5,000</option>
                          <option value="₹5,000 - ₹7,000">₹5,000 - ₹7,000</option>
                          <option value="₹7,000 - ₹9,000">₹7,000 - ₹9,000</option>
                          <option value="₹9,000 - ₹12,000">₹9,000 - ₹12,000</option>
                          <option value="₹12,000 - ₹15,000">₹12,000 - ₹15,000</option>
                          <option value="₹15,000 - ₹20,000">₹15,000 - ₹20,000</option>
                          <option value="₹20,000 - ₹25,000">₹20,000 - ₹25,000</option>
                          <option value="₹25,000 - ₹30,000">₹25,000 - ₹30,000</option>
                          <option value="₹30,000+">₹30,000+</option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1.5">Lifestyle Tags</label>
                        <div class="flex flex-wrap gap-2">
                          <button 
                            *ngFor="let tag of availableTags"
                            type="button"
                            (click)="toggleTag(tag)"
                            class="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
                            [class.bg-primary]="formData.tags.includes(tag)"
                            [class.text-white]="formData.tags.includes(tag)"
                            [class.bg-gray-100]="!formData.tags.includes(tag)"
                            [class.text-gray-600]="!formData.tags.includes(tag)">
                            {{ tag }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div *ngIf="errorMessage" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                    {{ errorMessage }}
                  </div>
                  
                  <button 
                    type="submit" 
                    [disabled]="!isFormValid() || isLoading"
                    class="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <svg *ngIf="isLoading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                  </button>
                  
                  <p class="text-center text-sm text-gray-500">
                    Already have an account? 
                    <a routerLink="/sign-in" class="text-primary hover:underline font-medium">Sign In</a>
                  </p>
                </form>
              </div>
            </div>
            
            <!-- Right: Info / Preview -->
            <div class="lg:col-span-7">
              <div class="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/10">
                <h2 class="text-xl font-bold text-gray-900 mb-4">Why join RoomieFind?</h2>
                <ul class="space-y-4 text-gray-600">
                  <li class="flex items-start gap-3">
                    <div class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Browse verified roommate profiles in your area</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <div class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Filter by budget, lifestyle, and preferences</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <div class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Connect directly with potential roommates</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <div class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>All stored locally - your data stays private</span>
                  </li>
                </ul>
                
                <div class="mt-8 p-4 bg-white rounded-xl border border-gray-100">
                  <p class="text-sm text-gray-500 italic">
                    "Found my perfect roommate within 3 days of signing up! The lifestyle matching really works."
                  </p>
                  <p class="text-xs text-gray-400 mt-2">— Priya, Software Trainee</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  `
})
export class SignUpComponent {
  formData = {
    email: '',
    password: '',
    name: '',
    age: null as number | null,
    occupation: '',
    preferredArea: '',
    budget: '',
    tags: [] as string[]
  };

  errorMessage = '';
  isLoading = false;
  availableTags = ['Non-Smoker', 'Vegetarian', 'Night Owl', 'Clean', 'Early Bird', 'Pet Friendly', 'Studious'];

  constructor(
    private authService: FirestoreAuthService,
    private router: Router
  ) {}

  toggleTag(tag: string): void {
    const index = this.formData.tags.indexOf(tag);
    if (index > -1) {
      this.formData.tags.splice(index, 1);
    } else {
      this.formData.tags.push(tag);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.email &&
      this.formData.password &&
      this.formData.password.length >= 6 &&
      this.formData.name &&
      this.formData.age &&
      this.formData.occupation &&
      this.formData.preferredArea &&
      this.formData.budget
    );
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      this.isLoading = false;
      return;
    }

    this.authService.signUp(
      this.formData.email,
      this.formData.password,
      {
        email: this.formData.email,
        name: this.formData.name,
        age: this.formData.age!,
        occupation: this.formData.occupation,
        preferredArea: this.formData.preferredArea,
        budget: this.formData.budget,
        tags: this.formData.tags,
        isProfileVisible: false
      }
    ).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/browse-profiles']);
        } else {
          this.errorMessage = 'Email already registered. Please sign in instead.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Failed to create account. Please try again.';
      }
    });
  }
}
