/**
 * @deprecated This is a local in-memory service. 
 * For production with Firestore, use FirestoreAuthService instead.
 * 
 * To switch:
 * 1. Import FirestoreAuthService from './firestore-auth.service'
 * 2. Replace AuthService with FirestoreAuthService in your component
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Also re-export Firestore User type for migration
export type { User as FirestoreUser } from './firestore-auth.service';

// Local User interface for in-memory service
export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  occupation: string;
  preferredArea: string;
  budget: string;
  tags: string[];
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private users: User[] = []; // In-memory user storage

  constructor() {
    // Check if user data exists in localStorage (optional persistence)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  signUp(userData: Omit<User, 'id'>): boolean {
    // Check if email already exists
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      console.error('Email already registered');
      return false;
    }

    // Create new user with generated ID
    const newUser: User = {
      ...userData,
      id: 'user_' + Date.now()
    };

    // Store in memory
    this.users.push(newUser);
    this.currentUserSubject.next(newUser);
    
    // Optional: persist to localStorage
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    console.log('User signed up:', newUser);
    return true;
  }

  signIn(email: string, password: string): boolean {
    // Check if user exists in memory
    const user = this.users.find(u => u.email === email);
    
    if (user) {
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('User signed in:', user);
      return true;
    }

    // User not found
    return false;
  }

  signOut(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    console.log('User signed out');
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateUserProfile(updates: Partial<User>): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) return false;

    const updatedUser = { ...currentUser, ...updates };
    
    // Update in users array
    const index = this.users.findIndex(u => u.id === currentUser.id);
    if (index > -1) {
      this.users[index] = updatedUser;
    }

    // Update current user
    this.currentUserSubject.next(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return true;
  }
}
