import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Roommate } from '../../models/roommate.model';
import { FirestoreConnectionService } from '../../services/firestore-connection.service';
import { FirestoreAuthService } from '../../services/firestore-auth.service';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <!-- Header Row -->
      <div class="flex items-start gap-3 mb-3">
        <!-- Avatar -->
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
          [style.background-color]="roommate.avatarColor">
          {{ roommate.initials }}
        </div>
        
        <!-- Name & Role -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-gray-900 font-semibold text-sm">{{ roommate.name }}</h3>
            <span class="text-gray-400 text-xs">{{ roommate.age }}</span>
            <span class="text-gray-400 text-xs">•</span>
            <span class="text-gray-500 text-xs">{{ roommate.role }}</span>
          </div>
        </div>
        
        <!-- Price Tag -->
        <div class="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0">
          ₹{{ roommate.monthlyPrice.toLocaleString() }} / month
        </div>
      </div>
      
      <!-- Description -->
      <p class="text-gray-500 text-sm mb-3 leading-relaxed">
        {{ roommate.description }}
      </p>
      
      <!-- Location & Sharing Info -->
      <p class="text-gray-400 text-xs mb-3">
        {{ roommate.location }} • {{ roommate.sharingInfo }}
      </p>
      
      <!-- Tags -->
      <div class="flex flex-wrap gap-2 mb-4">
        <span 
          *ngFor="let tag of roommate.tags" 
          class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          {{ tag }}
        </span>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button class="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition-colors">
          View Profile
        </button>
        <!-- Hide connect/message buttons for own profile -->
        <ng-container *ngIf="!isSelf">
          <button
            *ngIf="!isMatched"
            (click)="sendRequest()"
            [disabled]="!isLoggedIn || hasPendingRequest || requestSent"
            class="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="!requestSent && !hasPendingRequest">Connect</span>
            <span *ngIf="hasPendingRequest">Pending</span>
            <span *ngIf="requestSent">Sent!</span>
          </button>
          <a
            *ngIf="isMatched"
            [routerLink]="['/chat', roommate.id]"
            class="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors text-center flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Message
          </a>
        </ng-container>
        <span *ngIf="isSelf" class="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 text-center">
          Your Profile
        </span>
      </div>
      
      <!-- Login prompt -->
      <p *ngIf="!isLoggedIn" class="text-xs text-gray-400 mt-2 text-center">
        <a href="/sign-in" class="text-primary hover:underline">Sign in</a> to connect
      </p>
    </div>
  `
})
export class ProfileCardComponent implements OnInit {
  @Input() roommate!: Roommate;

  isLoggedIn = false;
  hasPendingRequest = false;
  requestSent = false;
  isMatched = false;
  isSelf = false; // True if this is the current user's own profile

  constructor(
    private connectionService: FirestoreConnectionService,
    private authService: FirestoreAuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(async user => {
      this.isLoggedIn = !!user;
      if (user && this.roommate?.id) {
        // Check if this is the user's own profile
        this.isSelf = user.id === this.roommate.id;
        if (!this.isSelf) {
          this.hasPendingRequest = await this.connectionService.hasPendingRequest(this.roommate.id);
          this.isMatched = await this.connectionService.isMatchedWith(this.roommate.id);
        }
        console.log('[ProfileCard] Status check - self:', this.isSelf, 'pending:', this.hasPendingRequest, 'matched:', this.isMatched);
      }
    });
  }

  async sendRequest(): Promise<void> {
    if (!this.isLoggedIn || this.isSelf) {
      console.log('[ProfileCard] Cannot send request - not logged in or self');
      return;
    }

    console.log('[ProfileCard] Sending request to:', this.roommate.id, this.roommate.name);
    const success = await this.connectionService.sendRequest(
      this.roommate.id,
      this.roommate.name,
      `Hi! I'm interested in being your roommate.`
    );

    console.log('[ProfileCard] Request result:', success);
    if (success) {
      this.requestSent = true;
      this.hasPendingRequest = true;
    }
  }
}
