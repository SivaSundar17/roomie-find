import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, query, where, getDocs, onSnapshot, Timestamp, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FirestoreAuthService, User } from './firestore-auth.service';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface ConnectionRequest {
  id?: string;
  fromUserId: string;
  fromUserName: string;
  fromUserInitials: string;
  fromUserAvatarColor?: string;
  toUserId: string;
  toUserName: string;
  message: string;
  status: ConnectionStatus;
  createdAt: Date;
  respondedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreConnectionService {
  private firestore: Firestore = inject(Firestore);
  private authService: FirestoreAuthService = inject(FirestoreAuthService);
  
  private requestsSubject = new BehaviorSubject<ConnectionRequest[]>([]);
  public requests$: Observable<ConnectionRequest[]> = this.requestsSubject.asObservable();
  
  private currentUser: User | null = null;
  private unsubscribeReceived: (() => void) | null = null;
  private unsubscribeSent: (() => void) | null = null;

  // BehaviorSubject for sent requests (real-time)
  private sentRequestsSubject = new BehaviorSubject<ConnectionRequest[]>([]);
  public sentRequests$: Observable<ConnectionRequest[]> = this.sentRequestsSubject.asObservable();

  constructor() {
    console.log('[ConnectionService] Initializing...');
    this.authService.currentUser$.subscribe(user => {
      console.log('[ConnectionService] Auth user changed:', user?.id);
      this.currentUser = user;
      if (user) {
        console.log('[ConnectionService] Setting up listeners for user:', user.id);
        this.listenToReceivedRequests(user.id);
        this.listenToSentRequests(user.id);
      } else {
        console.log('[ConnectionService] No user, clearing data');
        this.requestsSubject.next([]);
        this.sentRequestsSubject.next([]);
        this.unsubscribeListeners();
      }
    });
  }

  private unsubscribeListeners(): void {
    if (this.unsubscribeReceived) {
      this.unsubscribeReceived();
      this.unsubscribeReceived = null;
    }
    if (this.unsubscribeSent) {
      this.unsubscribeSent();
      this.unsubscribeSent = null;
    }
  }

  private listenToReceivedRequests(userId: string): void {
    if (this.unsubscribeReceived) {
      this.unsubscribeReceived();
    }

    const requestsRef = collection(this.firestore, 'connectionRequests');
    const q = query(
      requestsRef,
      where('toUserId', '==', userId)
    );

    this.unsubscribeReceived = onSnapshot(q, (snapshot) => {
      console.log('[ConnectionService] Received requests snapshot, count:', snapshot.size);
      const requests: ConnectionRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate() || new Date(),
          respondedAt: data['respondedAt']?.toDate()
        } as ConnectionRequest);
      });
      console.log('[ConnectionService] Emitting received requests:', requests.length);
      this.requestsSubject.next(requests);
    }, (error) => {
      console.error('[ConnectionService] Error listening to received requests:', error);
      console.error('[ConnectionService] Error details:', error.message, error.code);
    });
  }

  private listenToSentRequests(userId: string): void {
    if (this.unsubscribeSent) {
      this.unsubscribeSent();
    }

    const requestsRef = collection(this.firestore, 'connectionRequests');
    const q = query(
      requestsRef,
      where('fromUserId', '==', userId)
    );

    this.unsubscribeSent = onSnapshot(q, (snapshot) => {
      console.log('[ConnectionService] Sent requests snapshot received, count:', snapshot.size);
      const requests: ConnectionRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate() || new Date(),
          respondedAt: data['respondedAt']?.toDate()
        } as ConnectionRequest);
      });
      console.log('[ConnectionService] Emitting sent requests:', requests.length);
      this.sentRequestsSubject.next(requests);
    }, (error) => {
      console.error('[ConnectionService] Error listening to sent requests:', error);
      console.error('[ConnectionService] Error details:', error.message, error.code);
    });
  }

  async sendRequest(toUserId: string, toUserName: string, message: string): Promise<boolean> {
    console.log('[ConnectionService] sendRequest called:', { from: this.currentUser?.id, to: toUserId, toName: toUserName });
    if (!this.currentUser) {
      console.error('[ConnectionService] Cannot send request - no current user');
      return false;
    }

    // Prevent sending request to yourself
    if (this.currentUser.id === toUserId) {
      console.error('[ConnectionService] Cannot send request to yourself');
      return false;
    }

    // Check if already sent
    const existing = await this.checkExistingRequest(toUserId);
    if (existing) {
      console.log('[ConnectionService] Request already exists to:', toUserId);
      return false;
    }

    const request: Omit<ConnectionRequest, 'id'> = {
      fromUserId: this.currentUser.id,
      fromUserName: this.currentUser.name,
      fromUserInitials: this.getInitials(this.currentUser.name),
      fromUserAvatarColor: '#0d9488',
      toUserId,
      toUserName,
      message,
      status: 'pending',
      createdAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(this.firestore, 'connectionRequests'), {
        ...request,
        createdAt: Timestamp.now()
      });
      console.log('[ConnectionService] Request sent successfully, doc ID:', docRef.id);
      return true;
    } catch (error) {
      console.error('[ConnectionService] Error sending request:', error);
      return false;
    }
  }

  private async checkExistingRequest(toUserId: string): Promise<boolean> {
    if (!this.currentUser) return false;

    const requestsRef = collection(this.firestore, 'connectionRequests');
    const q = query(
      requestsRef,
      where('fromUserId', '==', this.currentUser.id),
      where('toUserId', '==', toUserId),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  // Public method to check if current user has pending request to specific user
  async hasPendingRequest(toUserId: string): Promise<boolean> {
    return this.checkExistingRequest(toUserId);
  }

  // Check if already matched (accepted connection) with specific user
  async isMatchedWith(otherUserId: string): Promise<boolean> {
    if (!this.currentUser) return false;

    const requestsRef = collection(this.firestore, 'connectionRequests');

    // Check both directions: I sent and they accepted, OR they sent and I accepted
    const q1 = query(
      requestsRef,
      where('fromUserId', '==', this.currentUser.id),
      where('toUserId', '==', otherUserId),
      where('status', '==', 'accepted')
    );

    const q2 = query(
      requestsRef,
      where('fromUserId', '==', otherUserId),
      where('toUserId', '==', this.currentUser.id),
      where('status', '==', 'accepted')
    );

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const isMatched = !snapshot1.empty || !snapshot2.empty;
    console.log('[ConnectionService] isMatchedWith check:', otherUserId, 'result:', isMatched);
    return isMatched;
  }

  async respondToRequest(requestId: string, response: 'accepted' | 'rejected'): Promise<boolean> {
    try {
      const requestRef = doc(this.firestore, 'connectionRequests', requestId);
      await updateDoc(requestRef, {
        status: response,
        respondedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error responding to request:', error);
      return false;
    }
  }

  getRequestsForCurrentUser(): ConnectionRequest[] {
    return this.requestsSubject.value;
  }

  getReceivedRequests(): ConnectionRequest[] {
    if (!this.currentUser) return [];
    return this.requestsSubject.value.filter(r => r.toUserId === this.currentUser!.id);
  }

  getSentRequests(): Observable<ConnectionRequest[]> {
    return this.sentRequests$;
  }

  getMatches(): Observable<ConnectionRequest[]> {
    if (!this.currentUser) return of([]);

    const requestsRef = collection(this.firestore, 'connectionRequests');

    // Fetch matches where user is either sender or recipient
    const q = query(
      requestsRef,
      where('status', '==', 'accepted'),
      where('fromUserId', '==', this.currentUser.id)
    );

    const q2 = query(
      requestsRef,
      where('status', '==', 'accepted'),
      where('toUserId', '==', this.currentUser.id)
    );

    // Combine both queries
    return from(Promise.all([getDocs(q), getDocs(q2)])).pipe(
      map(([snapshot1, snapshot2]) => {
        const sentMatches = snapshot1.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data['createdAt']?.toDate() || new Date()
          } as ConnectionRequest;
        });
        const receivedMatches = snapshot2.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data['createdAt']?.toDate() || new Date()
          } as ConnectionRequest;
        });
        return [...sentMatches, ...receivedMatches];
      }),
      catchError((err) => {
        console.error('Error fetching matches:', err);
        return of([]);
      })
    );
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
