import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FirestoreAuthService } from '../../services/firestore-auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />
      
      <main class="px-6 lg:px-12 py-16">
        <div class="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h1 class="text-2xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h1>
          <p class="text-gray-500 text-center mb-8">Sign in to continue your roommate search</p>
          
          <form class="space-y-5" (ngSubmit)="onSubmit()">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                [(ngModel)]="email"
                name="email"
                required
                placeholder="you@example.com"
                class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                [(ngModel)]="password"
                name="password"
                required
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
            </div>
            
            <div *ngIf="errorMessage" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {{ errorMessage }}
            </div>
            
            <button 
              type="submit" 
              [disabled]="isLoading"
              class="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <svg *ngIf="isLoading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Signing In...' : 'Sign In' }}
            </button>
          </form>
          
          <p class="text-center mt-6 text-gray-500 text-sm">
            New here? 
            <a routerLink="/sign-up" class="text-primary hover:underline font-medium">Sign up & Create Profile</a>
          </p>
        </div>
      </main>
    </div>
  `
})
export class SignInComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: FirestoreAuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      this.isLoading = false;
      return;
    }

    this.authService.signIn(this.email, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/browse-profiles']);
        } else {
          this.errorMessage = 'Invalid email or password';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Failed to sign in. Please try again.';
      }
    });
  }
}
