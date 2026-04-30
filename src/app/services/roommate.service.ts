/**
 * @deprecated Use FirestoreAuthService.getAllUsers() instead.
 * This service is kept for compatibility but returns empty data.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Roommate } from '../models/roommate.model';

@Injectable({
  providedIn: 'root'
})
export class RoommateService {
  // No mock data - use Firestore for real user data
  getRoommates(): Observable<Roommate[]> {
    return of([]);
  }

  getRoommateById(id: string): Observable<Roommate | undefined> {
    return of(undefined);
  }
}
