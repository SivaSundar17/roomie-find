import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, query, where, getDocs, onSnapshot, Timestamp, deleteDoc, writeBatch } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FirestoreAuthService, User } from './firestore-auth.service';

export interface Listing {
  id?: string;
  userId: string;
  userName: string;
  userInitials: string;
  title: string;
  description: string;
  location: string;
  monthlyRent: number;
  roomType: '1BHK' | '2BHK' | '3BHK' | 'Shared Room';
  lookingFor: 'Male' | 'Female' | 'Any';
  lookingForCount: number;
  amenities: string[];
  availableFrom: string;
  status: 'active' | 'filled' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListingData {
  title: string;
  description: string;
  location: string;
  monthlyRent: number;
  roomType: '1BHK' | '2BHK' | '3BHK' | 'Shared Room';
  lookingFor: 'Male' | 'Female' | 'Any';
  lookingForCount: number;
  amenities: string[];
  availableFrom: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreListingService {
  private firestore: Firestore = inject(Firestore);
  private authService: FirestoreAuthService = inject(FirestoreAuthService);
  
  private listingsSubject = new BehaviorSubject<Listing[]>([]);
  public listings$: Observable<Listing[]> = this.listingsSubject.asObservable();
  
  private currentUser: User | null = null;
  private unsubscribeSnapshot: (() => void) | null = null;

  private availableAmenities = [
    'WiFi', 'AC', 'Washing Machine', 'Fridge', 
    'TV', 'Gym', 'Parking', 'Furnished', 'Geyser', 'Kitchen'
  ];

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Listen to all active listings
    this.listenToListings();
  }

  private listenToListings(): void {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }

    const listingsRef = collection(this.firestore, 'listings');
    const q = query(
      listingsRef,
      where('status', '==', 'active')
    );

    this.unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const listings: Listing[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date()
        } as Listing);
      });
      // Sort by createdAt desc
      listings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      this.listingsSubject.next(listings);
    }, (error) => {
      console.error('Error listening to listings:', error);
    });
  }

  getAvailableAmenities(): string[] {
    return [...this.availableAmenities];
  }

  getAllActiveListings(): Listing[] {
    return this.listingsSubject.value;
  }

  getMyListings(): Observable<Listing[]> {
    if (!this.currentUser) return of([]);
    
    const listingsRef = collection(this.firestore, 'listings');
    const q = query(
      listingsRef,
      where('userId', '==', this.currentUser.id)
    );
    
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        const listings = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as Listing;
        });
        // Sort by createdAt desc
        return listings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }),
      catchError(() => of([]))
    );
  }

  async createListing(data: CreateListingData): Promise<Listing | null> {
    if (!this.currentUser) return null;

    const newListing: Omit<Listing, 'id'> = {
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userInitials: this.getInitials(this.currentUser.name),
      ...data,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(this.firestore, 'listings'), {
        ...newListing,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      return { ...newListing, id: docRef.id };
    } catch (error) {
      console.error('Error creating listing:', error);
      return null;
    }
  }

  async updateListing(listingId: string, data: Partial<CreateListingData>): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const listingRef = doc(this.firestore, 'listings', listingId);
      await updateDoc(listingRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating listing:', error);
      return false;
    }
  }

  async updateStatus(listingId: string, status: 'active' | 'filled' | 'inactive'): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const listingRef = doc(this.firestore, 'listings', listingId);
      await updateDoc(listingRef, {
        status,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  }

  async deleteListing(listingId: string): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      await deleteDoc(doc(this.firestore, 'listings', listingId));
      return true;
    } catch (error) {
      console.error('Error deleting listing:', error);
      return false;
    }
  }

  async getListingById(id: string): Promise<Listing | null> {
    try {
      const docSnap = await getDocs(query(
        collection(this.firestore, 'listings'),
        where('__name__', '==', id)
      ));
      
      if (docSnap.empty) return null;
      
      const doc = docSnap.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data['createdAt']?.toDate() || new Date(),
        updatedAt: data['updatedAt']?.toDate() || new Date()
      } as Listing;
    } catch (error) {
      console.error('Error getting listing:', error);
      return null;
    }
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
