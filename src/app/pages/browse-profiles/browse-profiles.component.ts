import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ProfileCardComponent } from '../../components/profile-card/profile-card.component';
import { FirestoreAuthService, User } from '../../services/firestore-auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-browse-profiles',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, ProfileCardComponent],
  template: `
    <ng-container *ngIf="!showPrototypeSteps">
      <div class="min-h-screen bg-gray-50">
        <app-navbar />
        <main class="px-6 lg:px-12 py-8">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-3">Browse Roommates</h1>
              <p class="text-gray-500">Find your perfect match from verified profiles</p>
            </div>
            
            <!-- Filters -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
              <div class="flex flex-wrap gap-4">
                <input 
                  type="text" 
                  placeholder="Warangal / Hanamkonda"
                  [(ngModel)]="searchQuery"
                  (input)="filterProfiles()"
                  class="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm">
                  
                <select
                  [(ngModel)]="budgetFilter"
                  (change)="filterProfiles()"
                  class="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white text-sm">
                  <option value="">Budget</option>
                  <option value="3,000 - 5,000">₹3,000 - ₹5,000</option>
                  <option value="5,000 - 7,000">₹5,000 - ₹7,000</option>
                  <option value="7,000 - 9,000">₹7,000 - ₹9,000</option>
                  <option value="9,000 - 12,000">₹9,000 - ₹12,000</option>
                  <option value="12,000 - 15,000">₹12,000 - ₹15,000</option>
                  <option value="15,000 - 20,000">₹15,000 - ₹20,000</option>
                  <option value="20,000 - 25,000">₹20,000 - ₹25,000</option>
                  <option value="25,000 - 30,000">₹25,000 - ₹30,000</option>
                  <option value="30,000+">₹30,000+</option>
                </select>
                
                <select class="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white text-sm">
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">Any</option>
                </select>
                
                <select class="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white text-sm">
                  <option value="">Lifestyle</option>
                  <option value="Non-Smoker">Non-Smoker</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Night Owl">Night Owl</option>
                  <option value="Early Bird">Early Bird</option>
                </select>
              </div>
            </div>
            
            <!-- Error State -->
            <div *ngIf="error" class="text-center py-12 bg-red-50 rounded-xl">
              <p class="text-red-600 mb-2">{{ error }}</p>
              <button
                (click)="loadVisibleUsers()"
                class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors">
                Retry
              </button>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="text-center py-12">
              <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-gray-500">Loading profiles...</p>
            </div>

            <!-- Profile Grid -->
            <div *ngIf="!loading && !error" class="grid md:grid-cols-2 gap-6">
              <app-profile-card
                *ngFor="let user of filteredUsers"
                [roommate]="{
                  id: user.id,
                  name: user.name,
                  age: user.age,
                  role: user.occupation,
                  location: user.preferredArea,
                  initials: getInitials(user.name),
                  tags: user.tags,
                  avatarColor: '#0d9488',
                  monthlyPrice: extractPrice(user.budget),
                  description: user.bio || '',
                  sharingInfo: user.budget
                }"
              >
              </app-profile-card>
            </div>

            <div *ngIf="!loading && filteredUsers.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl">
              <p class="mb-2">No profiles found matching your criteria.</p>
              <p class="text-sm text-gray-400">Try adjusting your filters or check back later.</p>
            </div>
          </div>
        </main>
      </div>
    </ng-container>
    
    <!-- Embedded version for create-profile page -->
    <ng-container *ngIf="showPrototypeSteps">
      <div>
        <!-- Header with prototype steps -->
        <div class="flex items-start justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Browse Roommates</h2>
          <div class="text-right">
            <p class="text-xs text-gray-400 mb-1">Prototype step 1</p>
            <p class="text-xs text-gray-400">Prototype step 2</p>
          </div>
        </div>
        
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div class="flex flex-wrap gap-3">
            <input 
              type="text" 
              placeholder="Warangal / Hanamkonda"
              [(ngModel)]="searchQuery"
              (input)="filterProfiles()"
              class="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm flex-1 min-w-[140px]">
              
            <select 
              [(ngModel)]="budgetFilter"
              (change)="filterProfiles()"
              class="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white text-sm">
              <option value="">Budget</option>
              <option value="₹5k">₹5k</option>
              <option value="₹6k">₹6k</option>
              <option value="₹7k">₹7k</option>
              <option value="₹8k">₹8k</option>
            </select>
            
            <select class="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white text-sm">
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            
            <select class="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white text-sm">
              <option value="">Lifestyle</option>
              <option value="Non-Smoker">Non-Smoker</option>
              <option value="Vegetarian">Vegetarian</option>
            </select>
          </div>
        </div>
        
        <!-- Profile Grid -->
        <div class="grid md:grid-cols-2 gap-5">
          <app-profile-card
            *ngFor="let user of filteredUsers"
            [roommate]="{
              id: user.id,
              name: user.name,
              age: user.age,
              role: user.occupation,
              location: user.preferredArea,
              initials: getInitials(user.name),
              tags: user.tags,
              avatarColor: '#0d9488',
              monthlyPrice: extractPrice(user.budget),
              description: user.bio || '',
              sharingInfo: user.budget
            }"
          >
          </app-profile-card>
        </div>

        <div *ngIf="filteredUsers.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl">
          No profiles found matching your criteria.
        </div>
      </div>
    </ng-container>
  `
})
export class BrowseProfilesComponent implements OnInit, OnDestroy {
  @Input() showPrototypeSteps = false;

  allUsers: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  budgetFilter = '';
  loading = true;
  error: string | null = null;
  currentUserId: string | null = null;
  private authSub: Subscription | null = null;

  constructor(private authService: FirestoreAuthService) {}

  ngOnInit(): void {
    // Get current user ID first
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id || null;
      this.loadVisibleUsers();
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  loadVisibleUsers(): void {
    this.authService.getVisibleUsers().subscribe({
      next: (users) => {
        // Filter out current user so they don't see their own profile
        const otherUsers = users.filter(u => u.id !== this.currentUserId);
        console.log('Loaded visible users:', users.length, 'Filtered out self:', otherUsers.length);
        this.allUsers = otherUsers;
        this.filteredUsers = otherUsers;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Failed to load profiles. Please check console for details.';
        this.loading = false;
      }
    });
  }

  filterProfiles(): void {
    this.filteredUsers = this.allUsers.filter(user => {
      const matchesLocation = !this.searchQuery ||
        user.preferredArea?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesBudget = !this.budgetFilter ||
        user.budget?.includes(this.budgetFilter);
      return matchesLocation && matchesBudget;
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(date: any): string {
    if (!date) return 'Recently';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  extractPrice(budget: string): number {
    if (!budget) return 0;
    const match = budget.match(/(\d+),?\d*/);
    return match ? parseInt(match[1].replace(',', '')) : 0;
  }
}
