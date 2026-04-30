import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, doc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FirestoreAuthService, User } from './firestore-auth.service';

export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface Conversation {
  otherUser: User;
  lastMessage: Message;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreMessageService {
  private firestore: Firestore = inject(Firestore);
  private authService: FirestoreAuthService = inject(FirestoreAuthService);

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$: Observable<Message[]> = this.messagesSubject.asObservable();

  private currentUser: User | null = null;
  private unsubscribeSnapshot: (() => void) | null = null;

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user && this.unsubscribeSnapshot) {
        this.unsubscribeSnapshot();
        this.unsubscribeSnapshot = null;
      }
    });
  }

  // Send a message between matched users
  async sendMessage(receiverId: string, receiverName: string, content: string): Promise<boolean> {
    if (!this.currentUser) {
      console.error('[MessageService] No current user');
      return false;
    }

    const message: Omit<Message, 'id'> = {
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      receiverId,
      receiverName,
      content,
      createdAt: new Date(),
      read: false
    };

    try {
      await addDoc(collection(this.firestore, 'messages'), {
        ...message,
        createdAt: Timestamp.now()
      });
      console.log('[MessageService] Message sent to:', receiverId);
      return true;
    } catch (error) {
      console.error('[MessageService] Error sending message:', error);
      return false;
    }
  }

  // Listen to messages between two users
  listenToMessages(otherUserId: string): void {
    if (!this.currentUser) {
      console.log('[MessageService] No current user, cannot listen');
      return;
    }

    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }

    const messagesRef = collection(this.firestore, 'messages');
    const currentUserId = this.currentUser.id;

    console.log('[MessageService] Starting listener for messages between', currentUserId, 'and', otherUserId);

    // Query all messages where current user is sender OR receiver, then filter client-side
    // Simple queries without orderBy to avoid composite index requirements
    const q = query(
      messagesRef,
      where('senderId', '==', currentUserId)
    );

    const q2 = query(
      messagesRef,
      where('receiverId', '==', currentUserId)
    );

    // Combine both queries
    const allMessages: Message[] = [];
    const processedIds = new Set<string>();

    this.unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      console.log('[MessageService] Sender query snapshot size:', snapshot.size);
      allMessages.length = 0; // Clear array
      processedIds.clear();

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only include if between these two specific users
        if ((data['senderId'] === currentUserId && data['receiverId'] === otherUserId) ||
            (data['senderId'] === otherUserId && data['receiverId'] === currentUserId)) {
          processedIds.add(doc.id);
          allMessages.push({
            id: doc.id,
            ...data,
            createdAt: data['createdAt']?.toDate() || new Date()
          } as Message);
        }
      });

      // Sort by createdAt ascending
      allMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      console.log('[MessageService] Emitting messages from sender query:', allMessages.length);
      this.messagesSubject.next([...allMessages]);
    }, (error) => {
      console.error('[MessageService] Error in sender query:', error);
    });

    // Also listen to receiver side
    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      console.log('[MessageService] Receiver query snapshot size:', snapshot.size);
      // Merge new receiver messages
      snapshot.forEach((doc) => {
        if (processedIds.has(doc.id)) return;
        const data = doc.data();
        // Only include if between these two specific users
        if ((data['senderId'] === currentUserId && data['receiverId'] === otherUserId) ||
            (data['senderId'] === otherUserId && data['receiverId'] === currentUserId)) {
          processedIds.add(doc.id);
          allMessages.push({
            id: doc.id,
            ...data,
            createdAt: data['createdAt']?.toDate() || new Date()
          } as Message);
        }
      });

      // Sort by createdAt ascending
      allMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      console.log('[MessageService] Emitting messages from receiver query:', allMessages.length);
      this.messagesSubject.next([...allMessages]);
    }, (error) => {
      console.error('[MessageService] Error in receiver query:', error);
    });

    // Store both unsubscribe functions
    const originalUnsub = this.unsubscribeSnapshot;
    this.unsubscribeSnapshot = () => {
      originalUnsub?.();
      unsubscribe2?.();
    };
  }

  stopListening(): void {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }
    this.messagesSubject.next([]);
  }

  getMessages(): Observable<Message[]> {
    return this.messages$;
  }

  // Get user by ID (for displaying contact info)
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('[MessageService] Error fetching user:', error);
      return null;
    }
  }
}
