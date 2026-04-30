/**
 * @deprecated This is a local in-memory service.
 * For production with Firestore, use FirestoreListingService instead.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Listing, CreateListingData } from '../models/listing.model';
import { AuthService, User } from './auth.service';

// Re-export Firestore types for migration
export type { Listing as FirestoreListing, CreateListingData as FirestoreCreateListingData } from './firestore-listing.service';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private listingsSubject = new BehaviorSubject<Listing[]>([]);
  public listings$ = this.listingsSubject.asObservable();
  
  private currentUser: User | null = null;
  private readonly STORAGE_KEY = 'roomie_listings';

  private availableAmenities = [
    'WiFi', 'AC', 'Washing Machine', 'Fridge', 
    'TV', 'Gym', 'Parking', 'Furnished', 'Geyser', 'Kitchen'
  ];

  constructor(private authService: AuthService) {
    // Load from localStorage
    this.loadListings();
    
    // Track current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getAvailableAmenities(): string[] {
    return [...this.availableAmenities];
  }

  private loadListings(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const listings = JSON.parse(stored).map((l: any) => ({
          ...l,
          createdAt: new Date(l.createdAt),
          updatedAt: new Date(l.updatedAt)
        }));
        this.listingsSubject.next(listings);
      }
    } catch (e) {
      console.error('Failed to load listings', e);
    }
  }

  private saveListings(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.listingsSubject.value));
    this.listingsSubject.next([...this.listingsSubject.value]);
  }

  getAllActiveListings(): Listing[] {
    return this.listingsSubject.value.filter(l => l.status === 'active');
  }

  getMyListings(): Listing[] {
    if (!this.currentUser) return [];
    return this.listingsSubject.value.filter(l => l.userId === this.currentUser!.id);
  }

  createListing(data: CreateListingData): Listing | null {
    if (!this.currentUser) return null;

    const newListing: Listing = {
      id: 'list_' + Date.now(),
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userInitials: this.getInitials(this.currentUser.name),
      ...data,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const listings = this.listingsSubject.value;
    listings.unshift(newListing);
    this.saveListings();
    
    return newListing;
  }

  updateListing(listingId: string, data: Partial<CreateListingData>): boolean {
    if (!this.currentUser) return false;

    const listings = this.listingsSubject.value;
    const index = listings.findIndex(l => l.id === listingId && l.userId === this.currentUser!.id);
    
    if (index === -1) return false;

    listings[index] = {
      ...listings[index],
      ...data,
      updatedAt: new Date()
    };
    
    this.saveListings();
    return true;
  }

  updateStatus(listingId: string, status: 'active' | 'filled' | 'inactive'): boolean {
    if (!this.currentUser) return false;

    const listings = this.listingsSubject.value;
    const index = listings.findIndex(l => l.id === listingId && l.userId === this.currentUser!.id);
    
    if (index === -1) return false;

    listings[index].status = status;
    listings[index].updatedAt = new Date();
    
    this.saveListings();
    return true;
  }

  deleteListing(listingId: string): boolean {
    if (!this.currentUser) return false;

    const listings = this.listingsSubject.value;
    const filtered = listings.filter(l => !(l.id === listingId && l.userId === this.currentUser!.id));
    
    if (filtered.length === listings.length) return false;

    this.listingsSubject.next(filtered);
    this.saveListings();
    return true;
  }

  getListingById(id: string): Listing | undefined {
    return this.listingsSubject.value.find(l => l.id === id);
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
