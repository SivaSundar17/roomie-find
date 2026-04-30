import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  age: number;
  occupation: string;
  preferredArea: string;
  budget: string;
  tags: string[];
  bio?: string;
  isProfileVisible?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreAuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  private authReadySubject = new BehaviorSubject<boolean>(false);
  public authReady$ = this.authReadySubject.asObservable();

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        this.loadUserData(firebaseUser.uid);
      } else {
        this.currentUserSubject.next(null);
      }
      // Mark auth as ready after Firebase responds
      this.authReadySubject.next(true);
    });
  }

  private async loadUserData(uid: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        this.currentUserSubject.next({ ...userData, id: uid });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.currentUserSubject.next(null);
    }
  }

  signUp(email: string, password: string, userData: Partial<User>): Observable<boolean> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        const firebaseUser = userCredential.user;
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData.name || '',
          age: userData.age || 18,
          occupation: userData.occupation || '',
          preferredArea: userData.preferredArea || '',
          budget: userData.budget || '',
          tags: userData.tags || [],
          bio: userData.bio || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Save user data to Firestore
        return from(setDoc(doc(this.firestore, 'users', firebaseUser.uid), newUser)).pipe(
          map(() => {
            this.currentUserSubject.next(newUser);
            return true;
          })
        );
      }),
      catchError((error) => {
        console.error('Sign up error:', error);
        return of(false);
      })
    );
  }

  signIn(email: string, password: string): Observable<boolean> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        return this.loadUserDataObservable(userCredential.user.uid);
      }),
      catchError((error) => {
        console.error('Sign in error:', error);
        return of(false);
      })
    );
  }

  private loadUserDataObservable(uid: string): Observable<boolean> {
    return from(getDoc(doc(this.firestore, 'users', uid))).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          this.currentUserSubject.next({ ...userData, id: uid });
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  signOut(): Observable<boolean> {
    return from(signOut(this.auth)).pipe(
      map(() => {
        this.currentUserSubject.next(null);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  updateUserProfile(updates: Partial<User>): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) return false;

    const userRef = doc(this.firestore, 'users', currentUser.id);
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    from(updateDoc(userRef, updateData)).subscribe({
      next: () => {
        this.currentUserSubject.next({ ...currentUser, ...updates });
      },
      error: (err) => console.error('Update error:', err)
    });

    return true;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Get all users for browse profiles
  getAllUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return from(getDocs(usersRef)).pipe(
      map((snapshot) => {
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      }),
      catchError(() => of([]))
    );
  }

  // Get only users who have made their profile visible
  getVisibleUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    const visibleQuery = query(usersRef, where('isProfileVisible', '==', true));
    return from(getDocs(visibleQuery)).pipe(
      map((snapshot) => {
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      }),
      catchError(() => of([]))
    );
  }
}
