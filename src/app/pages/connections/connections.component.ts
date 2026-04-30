import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FirestoreConnectionService, ConnectionRequest } from '../../services/firestore-connection.service';
import { FirestoreAuthService, User } from '../../services/firestore-auth.service';
import { FirestoreMessageService } from '../../services/firestore-message.service';

@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />
      
      <main class="px-6 lg:px-12 py-8">
        <div class="max-w-6xl mx-auto" *ngIf="currentUser">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">My Connections</h1>
          <p class="text-gray-500 mb-6">Manage your roommate requests and matches</p>
          
          <!-- Debug Refresh Button -->
          <div class="mb-4 flex items-center gap-3">
            <button
              (click)="refreshData()"
              class="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh Data
            </button>
            <button
              (click)="debugFetchAllRequests()"
              class="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs hover:bg-yellow-200 transition-colors">
              DEBUG: Fetch All
            </button>
            <span class="text-xs text-gray-400">Open console (F12) for debug logs</span>
          </div>

          <!-- Tabs -->
          <div class="flex gap-2 mb-6">
            <button
              (click)="activeTab = 'all'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class.bg-primary]="activeTab === 'all'"
              [class.text-white]="activeTab === 'all'"
              [class.bg-white]="activeTab !== 'all'"
              [class.text-gray-700]="activeTab !== 'all'">
              All Requests ({{ allRequests.length }})
            </button>
            <button 
              (click)="activeTab = 'received'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class.bg-primary]="activeTab === 'received'"
              [class.text-white]="activeTab === 'received'"
              [class.bg-white]="activeTab !== 'received'"
              [class.text-gray-700]="activeTab !== 'received'">
              Received ({{ receivedRequests.length }})
            </button>
            <button 
              (click)="activeTab = 'sent'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class.bg-primary]="activeTab === 'sent'"
              [class.text-white]="activeTab === 'sent'"
              [class.bg-white]="activeTab !== 'sent'"
              [class.text-gray-700]="activeTab !== 'sent'">
              Sent ({{ sentRequests.length }})
            </button>
            <button 
              (click)="activeTab = 'matches'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class.bg-primary]="activeTab === 'matches'"
              [class.text-white]="activeTab === 'matches'"
              [class.bg-white]="activeTab !== 'matches'"
              [class.text-gray-700]="activeTab !== 'matches'">
              Matches ({{ acceptedRequests.length }})
            </button>
          </div>
          
          <!-- Requests Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              *ngFor="let request of filteredRequests" 
              class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              
              <!-- Header -->
              <div class="flex items-start gap-3 mb-4">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  [style.background-color]="getAvatarColor(request)">
                  {{ getInitials(request) }}
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">
                    {{ getDisplayName(request) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ request.fromUserId === currentUser.id ? 'You sent this' : 'Sent to you' }}
                  </p>
                </div>
                <span 
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  [class.bg-amber-100]="request.status === 'pending'"
                  [class.text-amber-700]="request.status === 'pending'"
                  [class.bg-green-100]="request.status === 'accepted'"
                  [class.text-green-700]="request.status === 'accepted'"
                  [class.bg-red-100]="request.status === 'rejected'"
                  [class.text-red-700]="request.status === 'rejected'">
                  {{ request.status | titlecase }}
                </span>
              </div>
              
              <!-- Message -->
              <p class="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                "{{ request.message }}"
              </p>
              
              <!-- Date -->
              <p class="text-xs text-gray-400 mb-4">
                {{ request.createdAt | date:'mediumDate' }}
              </p>
              
              <!-- Actions -->
              <div class="flex gap-2">
                <!-- Received pending actions -->
                <ng-container *ngIf="request.id && request.toUserId === currentUser.id && request.status === 'pending'">
                  <button
                    (click)="respond(request.id, 'accepted')"
                    class="flex-1 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors">
                    Accept
                  </button>
                  <button
                    (click)="respond(request.id, 'rejected')"
                    class="flex-1 px-3 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-red-300 hover:text-red-500 transition-colors">
                    Decline
                  </button>
                </ng-container>
                
                <!-- Match actions with Contact Info -->
                <ng-container *ngIf="request.status === 'accepted'">
                  <div class="w-full space-y-3">
                    <!-- Match Badge -->
                    <div class="flex items-center justify-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span class="text-sm font-medium">It's a Match!</span>
                    </div>

                    <!-- Contact Info (only for matches) -->
                    <div class="bg-blue-50 rounded-lg p-3 space-y-2" *ngIf="getMatchUser(request) as matchUser">
                      <p class="text-xs text-blue-600 font-medium uppercase tracking-wide">Contact Info</p>
                      <div class="flex items-center gap-2 text-sm">
                        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        <span class="text-gray-700">{{ matchUser.email }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-sm" *ngIf="matchUser.phone">
                        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        <span class="text-gray-700">{{ matchUser.phone }}</span>
                      </div>
                      <p class="text-xs text-gray-500" *ngIf="!matchUser.phone">Phone not shared</p>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2">
                      <a [routerLink]="['/chat', request.fromUserId === currentUser?.id ? request.toUserId : request.fromUserId]"
                         class="flex-1 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors text-center">
                        <span class="flex items-center justify-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                          </svg>
                          Message
                        </span>
                      </a>
                      <button
                        (click)="viewProfile(request.fromUserId === currentUser?.id ? request.toUserId : request.fromUserId)"
                        class="px-3 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-primary hover:text-primary transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </ng-container>
                
                <!-- Sent pending -->
                <ng-container *ngIf="request.fromUserId === currentUser.id && request.status === 'pending'">
                  <button disabled class="flex-1 px-3 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed">
                    Waiting for response...
                  </button>
                </ng-container>
                
                <!-- Rejected -->
                <ng-container *ngIf="request.status === 'rejected'">
                  <button disabled class="flex-1 px-3 py-2 bg-red-50 text-red-400 text-sm font-medium rounded-lg cursor-not-allowed">
                    Request declined
                  </button>
                </ng-container>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div *ngIf="filteredRequests.length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-100">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p class="text-gray-500 mb-6">{{ getEmptyStateMessage() }}</p>
            <button 
              routerLink="/browse-profiles"
              class="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
              Browse Roommates
            </button>
          </div>
        </div>
        
        <!-- Not logged in -->
        <div *ngIf="!currentUser" class="max-w-md mx-auto text-center py-16">
          <h1 class="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p class="text-gray-500 mb-6">You need to be logged in to view your connections.</p>
          <button 
            routerLink="/sign-in"
            class="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            Sign In
          </button>
        </div>
      </main>
    </div>
  `
})
export class ConnectionsComponent implements OnInit {
  currentUser: User | null = null;
  allRequests: ConnectionRequest[] = [];
  receivedRequests: ConnectionRequest[] = [];
  sentRequests: ConnectionRequest[] = [];
  acceptedRequests: ConnectionRequest[] = [];
  activeTab: 'all' | 'received' | 'sent' | 'matches' = 'all';

  // Store user details for matches (key: userId, value: User)
  matchUserDetails: Map<string, User> = new Map();

  constructor(
    private connectionService: FirestoreConnectionService,
    private authService: FirestoreAuthService,
    private router: Router,
    private messageService: FirestoreMessageService
  ) {}

  ngOnInit(): void {
    // Subscribe to real-time received requests FIRST
    this.connectionService.requests$.subscribe(requests => {
      console.log('[Connections] Received requests updated:', requests.length, requests);
      this.receivedRequests = requests;
      this.updateAllRequests();
    });

    // Subscribe to real-time sent requests
    this.connectionService.getSentRequests().subscribe(sent => {
      console.log('[Connections] Sent requests updated (real-time):', sent.length, sent);
      this.sentRequests = sent;
      this.updateAllRequests();
    });

    // Then get current user and load matches
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('[Connections] Current user changed:', user?.id, user?.name);
      if (user) {
        this.loadMatches();
      }
    });
  }

  private updateAllRequests(): void {
    this.allRequests = [...this.receivedRequests, ...this.sentRequests];
    console.log('[Connections] All requests updated. Received:', this.receivedRequests.length,
                'Sent:', this.sentRequests.length, 'Total:', this.allRequests.length);
  }

  refreshData(): void {
    console.log('[Connections] Manual refresh triggered');
    this.loadMatches();
    this.debugFetchSentRequests();
  }

  async debugFetchSentRequests(): Promise<void> {
    console.log('[Connections] DEBUG: Direct Firestore fetch for user:', this.currentUser?.id);
    try {
      const { collection, query, where, getDocs, getFirestore } = await import('@angular/fire/firestore');
      const firestore = getFirestore();
      const requestsRef = collection(firestore, 'connectionRequests');
      const q = query(requestsRef, where('fromUserId', '==', this.currentUser?.id));
      const snapshot = await getDocs(q);
      console.log('[Connections] DEBUG: Direct fetch found', snapshot.size, 'documents');
      snapshot.forEach(doc => {
        console.log('[Connections] DEBUG: Document', doc.id, doc.data());
      });
    } catch (err) {
      console.error('[Connections] DEBUG: Error fetching:', err);
    }
  }

  async debugFetchAllRequests(): Promise<void> {
    console.log('[Connections] DEBUG: Fetching ALL requests from Firestore (no filter)');
    try {
      const { collection, getDocs, getFirestore } = await import('@angular/fire/firestore');
      const firestore = getFirestore();
      const requestsRef = collection(firestore, 'connectionRequests');
      const snapshot = await getDocs(requestsRef);
      console.log('[Connections] DEBUG: Total requests in Firestore:', snapshot.size);
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log('[Connections] DEBUG: Request', doc.id, {
          fromUserId: data['fromUserId'],
          toUserId: data['toUserId'],
          fromUserName: data['fromUserName'],
          toUserName: data['toUserName'],
          status: data['status']
        });
      });
      // Check if any match current user
      const currentUserId = this.currentUser?.id;
      const matching = snapshot.docs.filter(d => d.data()['fromUserId'] === currentUserId || d.data()['toUserId'] === currentUserId);
      console.log('[Connections] DEBUG: Requests involving current user (' + currentUserId + '):', matching.length);
    } catch (err) {
      console.error('[Connections] DEBUG: Error fetching all:', err);
    }
  }

  loadMatches(): void {
    // Load matches only (sent and received are now real-time subscriptions)
    this.connectionService.getMatches().subscribe(async matches => {
      console.log('Matches loaded:', matches.length, matches);
      this.acceptedRequests = matches;

      // Fetch user details for each match to get email/phone
      for (const match of matches) {
        const otherUserId = match.fromUserId === this.currentUser?.id ? match.toUserId : match.fromUserId;
        if (otherUserId && !this.matchUserDetails.has(otherUserId)) {
          const user = await this.messageService.getUserById(otherUserId);
          if (user) {
            this.matchUserDetails.set(otherUserId, user);
          }
        }
      }
    });
  }

  getMatchUser(request: ConnectionRequest): User | undefined {
    const otherUserId = request.fromUserId === this.currentUser?.id ? request.toUserId : request.fromUserId;
    return otherUserId ? this.matchUserDetails.get(otherUserId) : undefined;
  }

  get filteredRequests(): ConnectionRequest[] {
    switch (this.activeTab) {
      case 'received': return this.receivedRequests;
      case 'sent': return this.sentRequests;
      case 'matches': return this.acceptedRequests;
      default: return this.allRequests;
    }
  }

  getDisplayName(request: ConnectionRequest): string {
    if (request.fromUserId === this.currentUser?.id) {
      return request.toUserName;
    }
    return request.fromUserName;
  }

  getInitials(request: ConnectionRequest): string {
    if (request.fromUserId === this.currentUser?.id) {
      // For sent requests, show recipient initials (we don't have them, so use first 2 chars of name)
      return request.toUserName.substring(0, 2).toUpperCase();
    }
    return request.fromUserInitials;
  }

  getAvatarColor(request: ConnectionRequest): string {
    if (request.fromUserId === this.currentUser?.id) {
      return '#0d9488'; // Default color for sent requests
    }
    return request.fromUserAvatarColor || '#0d9488';
  }

  async respond(requestId: string, response: 'accepted' | 'rejected'): Promise<void> {
    await this.connectionService.respondToRequest(requestId, response);
    // Real-time subscriptions will update automatically
  }

  viewProfile(userId: string | undefined): void {
    if (userId) {
      this.router.navigate(['/browse-profiles'], { queryParams: { viewUser: userId } });
    }
  }

  getEmptyStateMessage(): string {
    switch (this.activeTab) {
      case 'received': return 'No one has sent you a request yet. Check back later!';
      case 'sent': return 'You haven\'t sent any requests yet. Browse profiles to connect!';
      case 'matches': return 'No matches yet. Accept requests to create matches!';
      default: return 'Start connecting with roommates to see requests here.';
    }
  }
}
