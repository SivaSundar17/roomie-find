/**
 * @deprecated This is a local in-memory service.
 * For production with Firestore, use FirestoreConnectionService instead.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthService, User } from './auth.service';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

// Re-export Firestore types for migration
export type { ConnectionRequest as FirestoreConnectionRequest } from './firestore-connection.service';

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserInitials: string;
  fromUserAvatarColor: string;
  toUserId: string;
  toUserName: string;
  message: string;
  status: ConnectionStatus;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private requests: ConnectionRequest[] = [];
  private requestsSubject = new BehaviorSubject<ConnectionRequest[]>([]);
  public requests$ = this.requestsSubject.asObservable();

  constructor(private authService: AuthService) {
    // Load from localStorage if available
    const saved = localStorage.getItem('connectionRequests');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.requests = parsed.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt)
      }));
      this.requestsSubject.next(this.requests);
    }
  }

  private saveAndNotify(): void {
    localStorage.setItem('connectionRequests', JSON.stringify(this.requests));
    this.requestsSubject.next([...this.requests]);
  }

  sendRequest(toUserId: string, toUserName: string, message: string): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Must be logged in to send request');
      return false;
    }

    // Check if already sent
    const existing = this.requests.find(r => 
      r.fromUserId === currentUser.id && r.toUserId === toUserId && r.status === 'pending'
    );
    if (existing) {
      console.error('Request already pending');
      return false;
    }

    const newRequest: ConnectionRequest = {
      id: 'req_' + Date.now(),
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserInitials: this.getInitials(currentUser.name),
      fromUserAvatarColor: '#0d9488',
      toUserId: toUserId,
      toUserName: toUserName,
      message: message || 'Interested in connecting with you!',
      status: 'pending',
      createdAt: new Date()
    };

    this.requests.push(newRequest);
    this.saveAndNotify();
    return true;
  }

  respondToRequest(requestId: string, response: 'accepted' | 'rejected'): boolean {
    const request = this.requests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return false;

    request.status = response;
    this.saveAndNotify();
    return true;
  }

  getRequestsForCurrentUser(): ConnectionRequest[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];

    return this.requests.filter(r => 
      r.toUserId === currentUser.id || r.fromUserId === currentUser.id
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getReceivedRequests(): ConnectionRequest[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];

    return this.requests.filter(r => 
      r.toUserId === currentUser.id
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getSentRequests(): ConnectionRequest[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];

    return this.requests.filter(r => 
      r.fromUserId === currentUser.id
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  hasPendingRequest(toUserId: string): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    return this.requests.some(r => 
      r.fromUserId === currentUser.id && 
      r.toUserId === toUserId && 
      r.status === 'pending'
    );
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
