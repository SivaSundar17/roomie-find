import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FirestoreListingService, Listing } from '../../services/firestore-listing.service';
import { FirestoreAuthService } from '../../services/firestore-auth.service';
import { FirestoreConnectionService } from '../../services/firestore-connection.service';

@Component({
  selector: 'app-browse-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />
      
      <main class="px-6 lg:px-12 py-8">
        <div class="max-w-6xl mx-auto">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Browse Listings</h1>
              <p class="text-gray-500">Find places looking for roommates</p>
            </div>
            <a 
              *ngIf="isLoggedIn"
              routerLink="/my-listings"
              class="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
              Post Your Own
            </a>
          </div>
          
          <!-- Filters -->
          <div class="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
            <div class="flex flex-wrap gap-4 items-center">
              <div class="flex-1 min-w-[200px]">
                <input 
                  type="text"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="applyFilters()"
                  placeholder="Search by location..."
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm">
              </div>
              
              <select 
                [(ngModel)]="roomTypeFilter"
                (change)="applyFilters()"
                class="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white">
                <option value="">All Room Types</option>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="Shared Room">Shared Room</option>
              </select>
              
              <select 
                [(ngModel)]="lookingForFilter"
                (change)="applyFilters()"
                class="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white">
                <option value="">Looking For</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Any">Any</option>
              </select>
              
              <select 
                [(ngModel)]="budgetFilter"
                (change)="applyFilters()"
                class="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white">
                <option value="">Any Budget</option>
                <option value="5000">Under ₹5,000</option>
                <option value="8000">Under ₹8,000</option>
                <option value="10000">Under ₹10,000</option>
                <option value="15000">Under ₹15,000</option>
              </select>
            </div>
          </div>
          
          <!-- Results Count -->
          <p class="text-sm text-gray-500 mb-4">
            Showing {{ filteredListings.length }} active listing{{ filteredListings.length !== 1 ? 's' : '' }}
          </p>
          
          <!-- Listings Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              *ngFor="let listing of filteredListings" 
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              
              <!-- Header -->
              <div class="p-5 border-b border-gray-100">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    {{ listing.userInitials }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 text-sm">{{ listing.userName }}</p>
                    <p class="text-xs text-gray-500">Posted {{ listing.createdAt | date:'mediumDate' }}</p>
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
                  <div class="flex gap-2">
                    <span class="text-xs bg-gray-100 px-2 py-1 rounded">{{ listing.roomType }}</span>
                    <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {{ listing.lookingFor }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Body -->
              <div class="p-5 space-y-4">
                <p class="text-sm text-gray-600 line-clamp-3">{{ listing.description }}</p>
                
                <!-- Looking for -->
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500">Need:</span>
                  <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {{ listing.lookingForCount }} roommate{{ listing.lookingForCount > 1 ? 's' : '' }}
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
              
              <!-- Footer -->
              <div class="p-5 border-t border-gray-100 bg-gray-50">
                <!-- Not logged in -->
                <button
                  *ngIf="!isLoggedIn"
                  routerLink="/sign-in"
                  class="w-full px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-medium hover:border-primary hover:text-primary transition-colors">
                  Sign in to Connect
                </button>

                <!-- Logged in - check connection status -->
                <ng-container *ngIf="isLoggedIn">
                  <!-- Already matched - show Message button -->
                  <a *ngIf="getMatchStatus(listing.userId) === 'matched'"
                     [routerLink]="['/chat', listing.userId]"
                     class="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-center flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    Message
                  </a>

                  <!-- Pending request -->
                  <button *ngIf="getMatchStatus(listing.userId) === 'pending'"
                          disabled
                          class="w-full px-4 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed">
                    Request Pending...
                  </button>

                  <!-- Not connected - show Connect button -->
                  <button *ngIf="getMatchStatus(listing.userId) === 'none'"
                          (click)="connectWithLister(listing.userId, listing.userName)"
                          class="w-full px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                    Connect
                  </button>
                </ng-container>
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
            <h3 class="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
            <p class="text-gray-500 mb-6">Try adjusting your filters or check back later for new listings.</p>
            <button 
              (click)="clearFilters()"
              class="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
              Clear Filters
            </button>
          </div>
        </div>
      </main>
    </div>
  `
})
export class BrowseListingsComponent implements OnInit {
  rawListings: Listing[] = []; // All listings from Firestore (unfiltered)
  allListings: Listing[] = []; // Filtered to exclude own listings
  filteredListings: Listing[] = []; // After applying search filters
  isLoggedIn = false;

  // Filters
  searchQuery = '';
  roomTypeFilter = '';
  lookingForFilter = '';
  budgetFilter = '';

  // Track connection status for each listing user
  connectionStatus: Map<string, 'none' | 'pending' | 'matched'> = new Map();
  currentUserId: string | null = null;

  constructor(
    private listingService: FirestoreListingService,
    private authService: FirestoreAuthService,
    private connectionService: FirestoreConnectionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to real-time Firestore listings
    this.listingService.listings$.subscribe(listings => {
      this.rawListings = listings;
      this.updateFilteredListings();
    });

    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.currentUserId = user?.id || null;
      // Re-filter when user changes (to exclude own listings)
      this.updateFilteredListings();
      if (user) {
        this.checkConnectionStatuses();
      }
    });
  }

  updateFilteredListings(): void {
    // Filter out current user's own listings
    this.allListings = this.rawListings.filter(l => l.userId !== this.currentUserId);
    this.applyFilters();
    this.checkConnectionStatuses();
  }

  async checkConnectionStatuses(): Promise<void> {
    if (!this.isLoggedIn) return;

    for (const listing of this.filteredListings) {
      if (listing.userId && !this.connectionStatus.has(listing.userId)) {
        const [isPending, isMatched] = await Promise.all([
          this.connectionService.hasPendingRequest(listing.userId),
          this.connectionService.isMatchedWith(listing.userId)
        ]);

        if (isMatched) {
          this.connectionStatus.set(listing.userId, 'matched');
        } else if (isPending) {
          this.connectionStatus.set(listing.userId, 'pending');
        } else {
          this.connectionStatus.set(listing.userId, 'none');
        }
      }
    }
  }

  getMatchStatus(userId: string): 'none' | 'pending' | 'matched' {
    return this.connectionStatus.get(userId) || 'none';
  }

  applyFilters(): void {
    this.filteredListings = this.allListings.filter(listing => {
      // Search query
      if (this.searchQuery && !listing.location.toLowerCase().includes(this.searchQuery.toLowerCase()) && 
          !listing.title.toLowerCase().includes(this.searchQuery.toLowerCase())) {
        return false;
      }
      
      // Room type
      if (this.roomTypeFilter && listing.roomType !== this.roomTypeFilter) {
        return false;
      }
      
      // Looking for
      if (this.lookingForFilter && listing.lookingFor !== this.lookingForFilter) {
        return false;
      }
      
      // Budget
      if (this.budgetFilter && listing.monthlyRent > parseInt(this.budgetFilter)) {
        return false;
      }
      
      return true;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.roomTypeFilter = '';
    this.lookingForFilter = '';
    this.budgetFilter = '';
    this.applyFilters();
  }

  async connectWithLister(userId: string, userName: string): Promise<void> {
    const success = await this.connectionService.sendRequest(
      userId,
      userName,
      `Hi! I'm interested in your room listing.`
    );

    if (success) {
      this.connectionStatus.set(userId, 'pending');
    }
  }
}
