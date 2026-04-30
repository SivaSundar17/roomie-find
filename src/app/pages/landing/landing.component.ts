import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ProfileCardComponent } from '../../components/profile-card/profile-card.component';
import { RoommateService } from '../../services/roommate.service';
import { Roommate } from '../../models/roommate.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, ProfileCardComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <app-navbar />
      
      <main class="px-6 lg:px-12 py-12 lg:py-20">
        <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          <!-- Left Content -->
          <div class="space-y-6">
            <span class="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full">
              Web Prototype • Roommate Finder
            </span>
            
            <h1 class="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
              Find a roommate who matches your budget, area, and lifestyle.
            </h1>
            
            <p class="text-gray-500 text-lg leading-relaxed max-w-xl">
              RoomieFind is a simple web-based prototype for students and young professionals who want a better way to search for flatmates. Instead of depending on scattered WhatsApp messages, users can create a profile, browse roommate listings, and send connection requests.
            </p>
            
            <div class="flex flex-wrap gap-4 pt-4">
              <button 
                routerLink="/sign-up"
                class="btn-primary">
                Get Started - It's Free
              </button>
              <button 
                routerLink="/browse-profiles"
                class="btn-outline">
                Browse Roommates
              </button>
            </div>
          </div>
          
          <!-- Right Content - Mockup -->
          <div class="relative">
            <div class="bg-gray-100 rounded-3xl p-6 shadow-xl">
              <!-- Window Controls -->
              <div class="flex gap-2 mb-6">
                <div class="w-3 h-3 rounded-full bg-red-400"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div class="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              
              <!-- Profile Cards -->
              <div class="space-y-4">
                <app-profile-card 
                  *ngFor="let roommate of featuredRoommates" 
                  [roommate]="roommate">
                </app-profile-card>
              </div>
            </div>
            
            <!-- Decorative Elements -->
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          </div>
          
        </div>
      </main>
    </div>
  `
})
export class LandingComponent {
  featuredRoommates: Roommate[] = [];

  constructor(private roommateService: RoommateService) {
    this.roommateService.getRoommates().subscribe(roommates => {
      this.featuredRoommates = roommates.slice(0, 2);
    });
  }
}
