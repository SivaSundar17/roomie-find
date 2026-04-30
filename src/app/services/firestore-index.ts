/**
 * Firestore Services Index
 * 
 * Import all Firestore services from here:
 * 
 * Example:
 * ```typescript
 * import { 
 *   FirestoreAuthService, 
 *   FirestoreConnectionService,
 *   FirestoreListingService 
 * } from './services/firestore-index';
 * ```
 */

export { FirestoreAuthService } from './firestore-auth.service';
export type { User } from './firestore-auth.service';

export { FirestoreConnectionService } from './firestore-connection.service';
export type { ConnectionRequest, ConnectionStatus } from './firestore-connection.service';

export { FirestoreListingService } from './firestore-listing.service';
export type { Listing, CreateListingData } from './firestore-listing.service';
