import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FirestoreAuthService, User } from '../../services/firestore-auth.service';
import { FirestoreConnectionService, ConnectionRequest } from '../../services/firestore-connection.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />
      
      <main class="px-6 lg:px-12 py-8">
        <div class="max-w-6xl mx-auto" *ngIf="currentUser">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Edit Profile</h1>
              <p class="text-gray-500">Manage your profile and preferences</p>
            </div>
            <div class="flex items-center gap-3">
              <a 
                routerLink="/my-connections"
                class="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:border-primary hover:text-primary transition-colors">
                My Connections
              </a>
              <a 
                routerLink="/browse-profiles"
                class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                Browse Roommates
              </a>
            </div>
          </div>
          
          <!-- Tabs -->
          <div class="flex gap-2 mb-6">
            <button 
              (click)="activeTab = 'basic'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class.bg-primary]="activeTab === 'basic'"
              [class.text-white]="activeTab === 'basic'"
              [class.bg-white]="activeTab !== 'basic'"
              [class.text-gray-700]="activeTab !== 'basic'">
              Basic Info
            </button>
            <button 
              (click)="activeTab = 'preferences'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class.bg-primary]="activeTab === 'preferences'"
              [class.text-white]="activeTab === 'preferences'"
              [class.bg-white]="activeTab !== 'preferences'"
              [class.text-gray-700]="activeTab !== 'preferences'">
              Preferences
            </button>
            <button 
              (click)="activeTab = 'preview'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class.bg-primary]="activeTab === 'preview'"
              [class.text-white]="activeTab === 'preview'"
              [class.bg-white]="activeTab !== 'preview'"
              [class.text-gray-700]="activeTab !== 'preview'">
              Profile Preview
            </button>
          </div>
          
          <div class="grid lg:grid-cols-12 gap-8">
            
            <!-- Left: Edit Form -->
            <div class="lg:col-span-7">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <form class="space-y-6" (ngSubmit)="onSubmit()">
                  
                  <!-- Basic Info Tab -->
                  <div *ngIf="activeTab === 'basic'" class="space-y-5">
                    <div class="flex items-center gap-4 pb-6 border-b border-gray-100">
                      <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {{ getInitials(currentUser.name) }}
                      </div>
                      <div>
                        <h2 class="text-lg font-semibold text-gray-900">{{ formData.name || currentUser.name }}</h2>
                        <p class="text-sm text-gray-500">{{ currentUser.email }}</p>
                        <p class="text-xs text-gray-400 mt-1">Member since {{ joinDate }}</p>
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span class="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          [(ngModel)]="formData.name"
                          name="name"
                          required
                          class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          Age <span class="text-red-500">*</span>
                        </label>
                        <input 
                          type="number" 
                          [(ngModel)]="formData.age"
                          name="age"
                          required
                          min="18"
                          max="100"
                          class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        [(ngModel)]="formData.phone"
                        name="phone"
                        placeholder="e.g., +91 98765 43210"
                        class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                      <p class="text-xs text-gray-400 mt-1">Visible only to your matches</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Occupation <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="formData.occupation"
                        name="occupation"
                        required
                        placeholder="e.g., Student, Software Engineer"
                        class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Bio / About Me</label>
                      <textarea 
                        [(ngModel)]="formData.bio"
                        name="bio"
                        rows="3"
                        placeholder="Tell potential roommates about yourself..."
                        class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"></textarea>
                      <p class="text-xs text-gray-400 mt-1">{{ formData.bio?.length || 0 }}/200 characters</p>
                    </div>
                  </div>
                  
                  <!-- Preferences Tab -->
                  <div *ngIf="activeTab === 'preferences'" class="space-y-5">
                    <div class="pb-4 border-b border-gray-100">
                      <h3 class="text-sm font-medium text-gray-900 mb-1">Roommate Preferences</h3>
                      <p class="text-xs text-gray-500">These help us match you with compatible roommates</p>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Area <span class="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        [(ngModel)]="formData.preferredArea"
                        name="preferredArea"
                        required
                        placeholder="e.g., Hanamkonda, Near Campus, Kazipet"
                        class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Budget <span class="text-red-500">*</span>
                      </label>
                      <select 
                        [(ngModel)]="formData.budget"
                        name="budget"
                        required
                        class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white">
                        <option value="">Select your budget range</option>
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
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        Lifestyle Tags
                      </label>
                      <div class="flex flex-wrap gap-2">
                        <button 
                          *ngFor="let tag of availableTags"
                          type="button"
                          (click)="toggleTag(tag)"
                          class="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80"
                          [class.bg-primary]="formData.tags.includes(tag)"
                          [class.text-white]="formData.tags.includes(tag)"
                          [class.bg-gray-100]="!formData.tags.includes(tag)"
                          [class.text-gray-600]="!formData.tags.includes(tag)">
                          {{ tag }}
                        </button>
                      </div>
                      <p class="text-xs text-gray-400 mt-2">Select all that apply to you</p>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Gender Preference</label>
                      <div class="flex gap-3">
                        <label class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                          <input type="radio" name="genderPref" value="any" class="text-primary focus:ring-primary">
                          <span class="text-sm">Any</span>
                        </label>
                        <label class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                          <input type="radio" name="genderPref" value="male" class="text-primary focus:ring-primary">
                          <span class="text-sm">Male Only</span>
                        </label>
                        <label class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                          <input type="radio" name="genderPref" value="female" class="text-primary focus:ring-primary">
                          <span class="text-sm">Female Only</span>
                        </label>
                      </div>
                    </div>

                    <!-- Profile Visibility Toggle -->
                    <div class="pt-4 border-t border-gray-100">
                      <div class="flex items-center justify-between">
                        <div>
                          <label class="block text-sm font-medium text-gray-900">Show My Profile</label>
                          <p class="text-xs text-gray-500">Allow others to find you when browsing roommates</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            [(ngModel)]="formData.isProfileVisible"
                            name="isProfileVisible"
                            class="sr-only peer">
                          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      <div *ngIf="formData.isProfileVisible" class="mt-3 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        Your profile is visible to others
                      </div>
                      <div *ngIf="!formData.isProfileVisible" class="mt-3 p-3 bg-gray-100 text-gray-600 text-sm rounded-lg flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        </svg>
                        Your profile is hidden from browse
                      </div>
                    </div>
                  </div>
                  
                  <!-- Preview Tab -->
                  <div *ngIf="activeTab === 'preview'" class="space-y-5">
                    <div class="pb-4 border-b border-gray-100">
                      <h3 class="text-sm font-medium text-gray-900 mb-1">How others see you</h3>
                      <p class="text-xs text-gray-500">This is how your profile appears to potential roommates</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded-xl p-6">
                      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div class="flex items-start gap-3 mb-3">
                          <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                            {{ getInitials(formData.name || currentUser.name) }}
                          </div>
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                              <h3 class="text-gray-900 font-semibold text-sm">{{ formData.name || currentUser.name }}</h3>
                              <span class="text-gray-400 text-xs">{{ formData.age || '-' }}</span>
                              <span class="text-gray-400 text-xs">•</span>
                              <span class="text-gray-500 text-xs">{{ formData.occupation || '-' }}</span>
                            </div>
                          </div>
                          <div class="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0">
                            {{ formData.budget || 'Budget not set' }}
                          </div>
                        </div>
                        
                        <p class="text-gray-500 text-sm mb-3 leading-relaxed">
                          {{ formData.bio || 'No bio added yet.' }}
                        </p>
                        
                        <p class="text-gray-400 text-xs mb-3">
                          {{ formData.preferredArea || 'Location not set' }} • 2BHK sharing
                        </p>
                        
                        <div class="flex flex-wrap gap-2">
                          <span 
                            *ngFor="let tag of formData.tags" 
                            class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {{ tag }}
                          </span>
                          <span *ngIf="formData.tags.length === 0" class="text-xs text-gray-400">No tags selected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Success/Error Messages -->
                  <div *ngIf="successMessage" class="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ successMessage }}
                  </div>
                  
                  <div *ngIf="errorMessage" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                    {{ errorMessage }}
                  </div>
                  
                  <!-- Action Buttons -->
                  <div class="flex gap-3 pt-4 border-t border-gray-100">
                    <button 
                      type="button"
                      (click)="resetForm()"
                      class="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-primary hover:text-primary transition-colors">
                      Reset
                    </button>
                    <button 
                      type="submit"
                      [disabled]="!isFormValid()"
                      class="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
        
            <!-- Right: Quick Stats & Recent Activity -->
            <div class="lg:col-span-5 space-y-6">
              
              <!-- Profile Stats -->
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-sm font-medium text-gray-900 mb-4">Profile Stats</h3>
                <div class="grid grid-cols-3 gap-4">
                  <div class="text-center">
                    <p class="text-2xl font-bold text-primary">{{ connectionStats.received }}</p>
                    <p class="text-xs text-gray-500">Received</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-primary">{{ connectionStats.sent }}</p>
                    <p class="text-xs text-gray-500">Sent</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold text-green-600">{{ connectionStats.matches }}</p>
                    <p class="text-xs text-gray-500">Matches</p>
                  </div>
                </div>
              </div>
              
              <!-- Recent Activity -->
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-medium text-gray-900">Recent Activity</h3>
                  <a routerLink="/my-connections" class="text-xs text-primary hover:underline">View All</a>
                </div>
                
                <div class="space-y-3">
                  <div 
                    *ngFor="let request of recentRequests" 
                    class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div 
                      class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      [style.background-color]="request.fromUserAvatarColor || '#0d9488'">
                      {{ request.fromUserInitials }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-900 truncate">
                        {{ request.fromUserId === currentUser?.id ? 'Sent to ' + request.toUserName : request.fromUserName }}
                      </p>
                      <p class="text-xs text-gray-500">{{ request.status | titlecase }}</p>
                    </div>
                    <span 
                      class="w-2 h-2 rounded-full flex-shrink-0"
                      [class.bg-amber-400]="request.status === 'pending'"
                      [class.bg-green-400]="request.status === 'accepted'"
                      [class.bg-red-400]="request.status === 'rejected'">
                    </span>
                  </div>
                  
                  <div *ngIf="recentRequests.length === 0" class="text-center py-4 text-sm text-gray-400">
                    No recent activity
                  </div>
                </div>
              </div>
              
              <!-- Profile Tips -->
              <div class="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/10">
                <h3 class="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Profile Tips
                </h3>
                <ul class="space-y-2 text-xs text-gray-600">
                  <li class="flex items-start gap-2">
                    <span class="text-primary">•</span>
                    <span>Add a detailed bio to attract more roommates</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-primary">•</span>
                    <span>Select lifestyle tags that truly represent you</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-primary">•</span>
                    <span>Be specific about your preferred area</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-primary">•</span>
                    <span>Keep your budget range realistic</span>
                  </li>
                </ul>
              </div>
              
            </div>
          </div>
        </div>
        
        <!-- Not logged in message -->
        <div *ngIf="!currentUser" class="max-w-md mx-auto text-center py-16">
          <h1 class="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p class="text-gray-500 mb-6">You need to be logged in to edit your profile.</p>
          <button 
            routerLink="/sign-in"
            class="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            Sign In
          </button>
        </div>
      </main>
    </div>
  `
})
export class CreateProfileComponent implements OnInit {
  currentUser: User | null = null;
  activeTab: 'basic' | 'preferences' | 'preview' = 'basic';
  successMessage = '';
  errorMessage = '';
  
  formData = {
    name: '',
    age: 0,
    phone: '',
    occupation: '',
    preferredArea: '',
    budget: '',
    tags: [] as string[],
    bio: '',
    isProfileVisible: false
  };

  originalData: any = null;
  connectionStats = { received: 0, sent: 0, matches: 0 };
  recentRequests: ConnectionRequest[] = [];

  availableTags = ['Non-Smoker', 'Vegetarian', 'Night Owl', 'Clean', 'Early Bird', 'Pet Friendly', 'Studious', 'Gym Goer', 'Work From Home'];

  constructor(
    private authService: FirestoreAuthService,
    private connectionService: FirestoreConnectionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.populateForm(user);
        this.loadConnectionStats();
      }
    });

    // Subscribe to real-time received requests
    this.connectionService.requests$.subscribe(() => {
      this.loadConnectionStats();
    });
  }
  
  get joinDate(): string {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  
  populateForm(user: User): void {
    this.formData = {
      name: user.name,
      age: user.age,
      phone: user.phone || '',
      occupation: user.occupation,
      preferredArea: user.preferredArea,
      budget: user.budget,
      tags: [...user.tags],
      bio: user.bio || '',
      isProfileVisible: user.isProfileVisible ?? false
    };
    this.originalData = { ...this.formData };
  }
  
  loadConnectionStats(): void {
    // Get real-time received requests
    this.connectionService.requests$.subscribe(received => {
      this.connectionStats.received = received.length;

      // Get sent requests
      this.connectionService.getSentRequests().subscribe(sent => {
        this.connectionStats.sent = sent.length;

        // Get matches
        this.connectionService.getMatches().subscribe(matches => {
          this.connectionStats.matches = matches.length;

          // Combine and sort by date for recent activity
          const all = [...received, ...sent].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.recentRequests = all.slice(0, 5);
        });
      });
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

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
      this.formData.name &&
      this.formData.age &&
      this.formData.age >= 18 &&
      this.formData.occupation &&
      this.formData.preferredArea &&
      this.formData.budget
    );
  }
  
  resetForm(): void {
    if (this.originalData) {
      this.formData = { ...this.originalData };
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const success = this.authService.updateUserProfile({
      name: this.formData.name,
      age: this.formData.age,
      phone: this.formData.phone,
      occupation: this.formData.occupation,
      preferredArea: this.formData.preferredArea,
      budget: this.formData.budget,
      tags: this.formData.tags,
      bio: this.formData.bio,
      isProfileVisible: this.formData.isProfileVisible
    });

    if (success) {
      this.successMessage = 'Profile updated successfully!';
      this.originalData = { ...this.formData };
      setTimeout(() => this.successMessage = '', 3000);
    } else {
      this.errorMessage = 'Failed to update profile. Please try again.';
    }
  }
}
