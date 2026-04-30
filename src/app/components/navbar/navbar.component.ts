import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FirestoreAuthService, User } from '../../services/firestore-auth.service';
import { ConnectionService } from '../../services/connection.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="w-full py-4 px-6 lg:px-12 flex items-center justify-between bg-white border-b border-gray-100">
      <a routerLink="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
          R
        </div>
        <span class="font-bold text-lg text-gray-900">RoomieFind</span>
      </a>
      
      <!-- Not logged in -->
      <div *ngIf="!currentUser" class="flex items-center gap-4">
        <div class="relative group">
          <button class="text-gray-600 hover:text-primary font-medium text-sm flex items-center gap-1">
            Browse
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <a routerLink="/browse-profiles" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
              Roommate Profiles
            </a>
            <a routerLink="/browse-listings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
              Room Listings
            </a>
          </div>
        </div>
        <div class="flex items-center gap-2 pl-4 border-l border-gray-200">
          <button 
            routerLink="/sign-in"
            class="px-5 py-2 rounded-lg font-medium text-gray-600 hover:text-primary transition-colors">
            Sign In
          </button>
          <button 
            routerLink="/sign-up"
            class="px-5 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary-dark transition-colors">
            Sign Up
          </button>
        </div>
      </div>
      
      <!-- Logged in -->
      <div *ngIf="currentUser" class="flex items-center gap-4">
        <div class="relative group">
          <button class="text-gray-600 hover:text-primary font-medium text-sm flex items-center gap-1">
            Browse
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <a routerLink="/browse-profiles" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
              Roommate Profiles
            </a>
            <a routerLink="/browse-listings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
              Room Listings
            </a>
          </div>
        </div>
        <a routerLink="/my-listings" class="text-gray-600 hover:text-primary font-medium text-sm">
          My Listings
        </a>
        <a routerLink="/my-connections" class="text-gray-600 hover:text-primary font-medium text-sm relative">
          My Connections
          <span 
            *ngIf="pendingCount > 0"
            class="absolute -top-2 -right-3 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {{ pendingCount }}
          </span>
        </a>
        <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
          <a routerLink="/edit-profile" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
              {{ getInitials(currentUser.name) }}
            </div>
            <div class="hidden md:block">
              <p class="text-sm font-medium text-gray-900">{{ currentUser.name }}</p>
              <p class="text-xs text-gray-500">{{ currentUser.occupation }}</p>
            </div>
          </a>
          <div class="flex items-center gap-1 ml-2">
            <a 
              routerLink="/edit-profile"
              class="px-3 py-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
              title="Edit Profile">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </a>
            <button 
              (click)="signOut()"
              class="px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
              title="Logout">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  pendingCount = 0;

  constructor(
    private authService: FirestoreAuthService,
    private connectionService: ConnectionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.updatePendingCount();
      }
    });
    
    // Update count when requests change
    this.connectionService.requests$.subscribe(() => {
      this.updatePendingCount();
    });
  }
  
  updatePendingCount(): void {
    const received = this.connectionService.getReceivedRequests();
    this.pendingCount = received.filter(r => r.status === 'pending').length;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  signOut(): void {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
