import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FirestoreListingService, Listing, CreateListingData } from '../../services/firestore-listing.service';
import { FirestoreAuthService, User } from '../../services/firestore-auth.service';

@Component({
  selector: 'app-my-listings',
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
              <h1 class="text-2xl font-bold text-gray-900">My Listings</h1>
              <p class="text-gray-500">Manage your roommate wanted listings</p>
            </div>
            <button 
              (click)="showCreateModal = true"
              class="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Post New Listing
            </button>
          </div>
          
          <!-- Tabs -->
          <div class="flex gap-2 mb-6">
            <button 
              (click)="activeTab = 'active'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class.bg-primary]="activeTab === 'active'"
              [class.text-white]="activeTab === 'active'"
              [class.bg-white]="activeTab !== 'active'"
              [class.text-gray-700]="activeTab !== 'active'">
              Active ({{ activeCount }})
            </button>
            <button 
              (click)="activeTab = 'filled'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class.bg-primary]="activeTab === 'filled'"
              [class.text-white]="activeTab === 'filled'"
              [class.bg-white]="activeTab !== 'filled'"
              [class.text-gray-700]="activeTab !== 'filled'">
              Filled ({{ filledCount }})
            </button>
            <button 
              (click)="activeTab = 'inactive'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class.bg-primary]="activeTab === 'inactive'"
              [class.text-white]="activeTab === 'inactive'"
              [class.bg-white]="activeTab !== 'inactive'"
              [class.text-gray-700]="activeTab !== 'inactive'">
              Inactive ({{ inactiveCount }})
            </button>
          </div>
          
          <!-- Listings Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              *ngFor="let listing of filteredListings" 
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              
              <!-- Header -->
              <div class="p-5 border-b border-gray-100">
                <div class="flex items-start justify-between mb-3">
                  <span 
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                    [class.bg-green-100]="listing.status === 'active'"
                    [class.text-green-700]="listing.status === 'active'"
                    [class.bg-blue-100]="listing.status === 'filled'"
                    [class.text-blue-700]="listing.status === 'filled'"
                    [class.bg-gray-100]="listing.status === 'inactive'"
                    [class.text-gray-600]="listing.status === 'inactive'">
                    {{ listing.status | titlecase }}
                  </span>
                  <div class="flex gap-1">
                    <button 
                      (click)="editListing(listing)"
                      class="p-1.5 text-gray-400 hover:text-primary transition-colors"
                      title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                      </svg>
                    </button>
                    <button 
                      (click)="deleteListing(listing.id)"
                      class="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ listing.title }}</h3>
                
                <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {{ listing.location }}
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-primary font-bold text-lg">₹{{ listing.monthlyRent.toLocaleString() }}<span class="text-sm text-gray-400 font-normal">/mo</span></span>
                  <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{{ listing.roomType }}</span>
                </div>
              </div>
              
              <!-- Body -->
              <div class="p-5 space-y-4">
                <p class="text-sm text-gray-600 line-clamp-3">{{ listing.description }}</p>
                
                <!-- Looking for -->
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500">Looking for:</span>
                  <span class="text-xs font-medium text-gray-700 bg-primary/10 px-2 py-1 rounded">
                    {{ listing.lookingFor }} ({{ listing.lookingForCount }})
                  </span>
                </div>
                
                <!-- Amenities -->
                <div class="flex flex-wrap gap-1">
                  <span 
                    *ngFor="let amenity of listing.amenities.slice(0, 4)" 
                    class="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                    {{ amenity }}
                  </span>
                  <span *ngIf="listing.amenities.length > 4" class="px-2 py-1 text-gray-400 text-xs">
                    +{{ listing.amenities.length - 4 }} more
                  </span>
                </div>
                
                <!-- Available from -->
                <div class="flex items-center gap-2 text-xs text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Available from {{ listing.availableFrom | date:'mediumDate' }}
                </div>
              </div>
              
              <!-- Footer Actions -->
              <div class="p-5 border-t border-gray-100 bg-gray-50" *ngIf="listing.id && listing.status === 'active'">
                <div class="flex gap-2">
                  <button
                    (click)="updateStatus(listing.id, 'filled')"
                    class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Mark as Filled
                  </button>
                  <button
                    (click)="updateStatus(listing.id, 'inactive')"
                    class="px-3 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-300 transition-colors">
                    Pause
                  </button>
                </div>
              </div>

              <div class="p-5 border-t border-gray-100 bg-gray-50" *ngIf="listing.id && listing.status !== 'active'">
                <button
                  (click)="updateStatus(listing.id, 'active')"
                  class="w-full px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors">
                  Re-Activate
                </button>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div *ngIf="filteredListings.length === 0" class="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No {{ activeTab }} listings</h3>
            <p class="text-gray-500 mb-6">{{ getEmptyStateMessage() }}</p>
            <button 
              (click)="showCreateModal = true"
              class="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
              Create Your First Listing
            </button>
          </div>
        </div>
        
        <!-- Loading -->
        <div *ngIf="!authReady" class="max-w-md mx-auto text-center py-16">
          <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-500">Loading...</p>
        </div>

        <!-- Not logged in -->
        <div *ngIf="authReady && !currentUser" class="max-w-md mx-auto text-center py-16">
          <h1 class="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p class="text-gray-500 mb-6">You need to be logged in to manage your listings.</p>
          <button
            routerLink="/sign-in"
            class="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            Sign In
          </button>
        </div>
      </main>
      
      <!-- Create/Edit Modal -->
      <div 
        *ngIf="showCreateModal || editingListing" 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        (click)="closeModal()">
        <div 
          class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">
                {{ editingListing ? 'Edit Listing' : 'Post New Listing' }}
              </h2>
              <button 
                (click)="closeModal()"
                class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          
          <form class="p-6 space-y-5" (ngSubmit)="saveListing()">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Listing Title *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.title"
                name="title"
                required
                placeholder="e.g., 2BHK near Campus - Need 1 Roommate"
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
            </div>
            
            <!-- Location & Rent -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.location"
                  name="location"
                  required
                  placeholder="e.g., Near KU, Warangal"
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹) *</label>
                <input 
                  type="number" 
                  [(ngModel)]="formData.monthlyRent"
                  name="monthlyRent"
                  required
                  min="1000"
                  placeholder="8000"
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
              </div>
            </div>
            
            <!-- Room Type & Looking For -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
                <select 
                  [(ngModel)]="formData.roomType"
                  name="roomType"
                  required
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white">
                  <option value="">Select type</option>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                  <option value="Shared Room">Shared Room</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Looking For *</label>
                <div class="flex gap-2">
                  <select 
                    [(ngModel)]="formData.lookingFor"
                    name="lookingFor"
                    required
                    class="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Any">Any</option>
                  </select>
                  <input 
                    type="number" 
                    [(ngModel)]="formData.lookingForCount"
                    name="lookingForCount"
                    required
                    min="1"
                    max="5"
                    class="w-16 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-center">
                </div>
              </div>
            </div>
            
            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea 
                [(ngModel)]="formData.description"
                name="description"
                required
                rows="3"
                placeholder="Describe the place, rules, and what you're looking for in a roommate..."
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"></textarea>
            </div>
            
            <!-- Amenities -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
              <div class="flex flex-wrap gap-2">
                <button 
                  *ngFor="let amenity of availableAmenities"
                  type="button"
                  (click)="toggleAmenity(amenity)"
                  class="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80"
                  [class.bg-primary]="formData.amenities.includes(amenity)"
                  [class.text-white]="formData.amenities.includes(amenity)"
                  [class.bg-gray-100]="!formData.amenities.includes(amenity)"
                  [class.text-gray-600]="!formData.amenities.includes(amenity)">
                  {{ amenity }}
                </button>
              </div>
            </div>
            
            <!-- Available From -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Available From *</label>
              <input 
                type="date" 
                [(ngModel)]="formData.availableFrom"
                name="availableFrom"
                required
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
            </div>
            
            <!-- Error Message -->
            <div *ngIf="errorMessage" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {{ errorMessage }}
            </div>
            
            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                (click)="closeModal()"
                class="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-primary hover:text-primary transition-colors">
                Cancel
              </button>
              <button 
                type="submit"
                [disabled]="!isFormValid()"
                class="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ editingListing ? 'Update Listing' : 'Post Listing' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class MyListingsComponent implements OnInit {
  currentUser: User | null = null;
  myListings: Listing[] = [];
  activeTab: 'active' | 'filled' | 'inactive' = 'active';
  authReady = false; // Firebase auth initialization complete

  showCreateModal = false;
  editingListing: Listing | null = null;
  errorMessage = '';

  availableAmenities: string[] = [];

  formData: CreateListingData = {
    title: '',
    description: '',
    location: '',
    monthlyRent: 0,
    roomType: '2BHK',
    lookingFor: 'Any',
    lookingForCount: 1,
    amenities: [],
    availableFrom: ''
  };

  constructor(
    private listingService: FirestoreListingService,
    private authService: FirestoreAuthService
  ) {}

  ngOnInit(): void {
    // Wait for Firebase auth to be ready before showing anything
    this.authService.authReady$.subscribe(ready => {
      this.authReady = ready;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadListings();
      }
    });

    // Subscribe to real-time listings
    this.listingService.listings$.subscribe(() => {
      this.loadListings();
    });

    this.availableAmenities = ['WiFi', 'AC', 'Washing Machine', 'Fridge', 'TV', 'Gym', 'Parking', 'Furnished', 'Geyser', 'Kitchen'];

    // Set default available date to today
    this.formData.availableFrom = new Date().toISOString().split('T')[0];
  }

  loadListings(): void {
    this.listingService.getMyListings().subscribe((listings: Listing[]) => {
      this.myListings = listings;
    });
  }

  get filteredListings(): Listing[] {
    return this.myListings.filter(l => l.status === this.activeTab);
  }

  get activeCount(): number {
    return this.myListings.filter(l => l.status === 'active').length;
  }

  get filledCount(): number {
    return this.myListings.filter(l => l.status === 'filled').length;
  }

  get inactiveCount(): number {
    return this.myListings.filter(l => l.status === 'inactive').length;
  }

  toggleAmenity(amenity: string): void {
    const index = this.formData.amenities.indexOf(amenity);
    if (index > -1) {
      this.formData.amenities.splice(index, 1);
    } else {
      this.formData.amenities.push(amenity);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.title &&
      this.formData.description &&
      this.formData.location &&
      this.formData.monthlyRent > 0 &&
      this.formData.roomType &&
      this.formData.availableFrom
    );
  }

  editListing(listing: Listing): void {
    this.editingListing = listing;
    this.formData = {
      title: listing.title,
      description: listing.description,
      location: listing.location,
      monthlyRent: listing.monthlyRent,
      roomType: listing.roomType,
      lookingFor: listing.lookingFor,
      lookingForCount: listing.lookingForCount,
      amenities: [...listing.amenities],
      availableFrom: listing.availableFrom
    };
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.editingListing = null;
    this.errorMessage = '';
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      location: '',
      monthlyRent: 0,
      roomType: '2BHK',
      lookingFor: 'Any',
      lookingForCount: 1,
      amenities: [],
      availableFrom: new Date().toISOString().split('T')[0]
    };
  }

  async saveListing(): Promise<void> {
    this.errorMessage = '';
    
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.editingListing && this.editingListing.id) {
      const success = await this.listingService.updateListing(this.editingListing.id, this.formData);
      if (success) {
        this.closeModal();
        this.loadListings();
      } else {
        this.errorMessage = 'Failed to update listing';
      }
    } else {
      const listing = await this.listingService.createListing(this.formData);
      if (listing) {
        this.closeModal();
        this.loadListings();
        this.activeTab = 'active';
      } else {
        this.errorMessage = 'Failed to create listing';
      }
    }
  }

  async updateStatus(listingId: string, status: 'active' | 'filled' | 'inactive'): Promise<void> {
    await this.listingService.updateStatus(listingId, status);
    this.loadListings();
  }

  async deleteListing(listingId: string | undefined): Promise<void> {
    if (!listingId) return;
    if (confirm('Are you sure you want to delete this listing?')) {
      const success = await this.listingService.deleteListing(listingId);
      if (success) {
        this.loadListings();
      } else {
        alert('Failed to delete listing');
      }
    }
  }

  getEmptyStateMessage(): string {
    switch (this.activeTab) {
      case 'active': return 'You don\'t have any active listings. Create one to find roommates!';
      case 'filled': return 'No filled listings yet. Mark active listings as filled when you find roommates.';
      case 'inactive': return 'No inactive listings. Pause listings temporarily if needed.';
      default: return '';
    }
  }
}
