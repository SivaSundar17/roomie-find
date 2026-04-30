import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FirestoreMessageService, Message } from '../../services/firestore-message.service';
import { FirestoreAuthService, User } from '../../services/firestore-auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />

      <main class="px-4 lg:px-12 py-6">
        <div class="max-w-3xl mx-auto" *ngIf="currentUser">
          <!-- Header -->
          <div class="flex items-center gap-4 mb-6">
            <button
              (click)="goBack()"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ otherUser?.name || 'Chat' }}</h1>
              <p class="text-sm text-gray-500" *ngIf="otherUser">
                {{ otherUser.occupation }} • {{ otherUser.preferredArea }}
              </p>
            </div>
          </div>

          <!-- Contact Info Card (only for matches) -->
          <div *ngIf="otherUser" class="bg-blue-50 rounded-xl p-4 mb-6">
            <p class="text-xs text-blue-600 font-medium uppercase tracking-wide mb-3">Contact Information</p>
            <div class="space-y-2">
              <div class="flex items-center gap-3 text-sm">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span class="text-gray-700">{{ otherUser.email }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm" *ngIf="otherUser.phone">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span class="text-gray-700">{{ otherUser.phone }}</span>
              </div>
              <div *ngIf="!otherUser.phone" class="flex items-center gap-3 text-sm text-gray-500">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span>Phone number not shared</span>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
            <div class="h-96 overflow-y-auto p-4 space-y-4" #messageContainer>
              <div *ngIf="messages.length === 0" class="text-center py-12 text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p>No messages yet</p>
                <p class="text-sm">Start the conversation!</p>
              </div>

              <div *ngFor="let message of messages"
                   class="flex"
                   [class.justify-end]="message.senderId === currentUser.id">
                <div class="max-w-[80%]"
                     [class.bg-primary]="message.senderId === currentUser.id"
                     [class.text-white]="message.senderId === currentUser.id"
                     [class.bg-gray-100]="message.senderId !== currentUser.id"
                     [class.text-gray-700]="message.senderId !== currentUser.id"
                     class="rounded-2xl px-4 py-2.5">
                  <p class="text-sm">{{ message.content }}</p>
                  <p class="text-xs mt-1 opacity-70">
                    {{ message.createdAt | date:'shortTime' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <form (ngSubmit)="sendMessage()" class="flex gap-3">
              <input
                type="text"
                [(ngModel)]="newMessage"
                name="message"
                placeholder="Type a message..."
                class="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                [disabled]="sending">
              <button
                type="submit"
                [disabled]="!newMessage.trim() || sending"
                class="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <svg *ngIf="!sending" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                <span *ngIf="sending">Sending...</span>
                <span *ngIf="!sending">Send</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Not logged in -->
        <div *ngIf="!currentUser" class="text-center py-16">
          <p class="text-gray-500">Please sign in to view messages</p>
          <a routerLink="/sign-in" class="text-primary hover:underline mt-2 inline-block">Sign In</a>
        </div>
      </main>
    </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  otherUser: User | null = null;
  otherUserId: string = '';
  messages: Message[] = [];
  newMessage = '';
  sending = false;

  private messageSub: Subscription | null = null;
  private authSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: FirestoreMessageService,
    private authService: FirestoreAuthService
  ) {}

  ngOnInit(): void {
    this.otherUserId = this.route.snapshot.paramMap.get('userId') || '';

    if (!this.otherUserId) {
      this.router.navigate(['/connections']);
      return;
    }

    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadOtherUser();
        this.messageService.listenToMessages(this.otherUserId);
      }
    });

    this.messageSub = this.messageService.getMessages().subscribe(messages => {
      this.messages = messages;
    });
  }

  ngOnDestroy(): void {
    this.messageSub?.unsubscribe();
    this.authSub?.unsubscribe();
    this.messageService.stopListening();
  }

  async loadOtherUser(): Promise<void> {
    this.otherUser = await this.messageService.getUserById(this.otherUserId);
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || !this.otherUser) return;

    this.sending = true;
    const success = await this.messageService.sendMessage(
      this.otherUserId,
      this.otherUser.name,
      this.newMessage.trim()
    );

    if (success) {
      this.newMessage = '';
    }
    this.sending = false;
  }

  goBack(): void {
    this.router.navigate(['/connections'], { fragment: 'matches' });
  }
}
