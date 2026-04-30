# Firebase Firestore Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Enter project name (e.g., "roomie-find")
4. Enable Google Analytics (optional)
5. Create project

## 2. Register Web App

1. In Firebase Console, click the web icon (</>) to add a web app
2. Enter app nickname (e.g., "RoomieFind Web")
3. Click "Register app"
4. Copy the Firebase configuration object

## 3. Enable Authentication

1. Go to "Build" > "Authentication" in left sidebar
2. Click "Get started"
3. Enable "Email/Password" provider
4. Click "Save"

## 4. Create Firestore Database

1. Go to "Build" > "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in production mode" (or test mode for development)
4. Choose a location close to your users
5. Click "Create"

## 5. Create Collections

Create the following collections in Firestore:

### Collection: `users`
Document fields:
- `email` (string)
- `name` (string)
- `age` (number)
- `occupation` (string)
- `preferredArea` (string)
- `budget` (string)
- `tags` (array of strings)
- `bio` (string, optional)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Collection: `connectionRequests`
Document fields:
- `fromUserId` (string)
- `fromUserName` (string)
- `fromUserInitials` (string)
- `fromUserAvatarColor` (string)
- `toUserId` (string)
- `toUserName` (string)
- `message` (string)
- `status` (string: "pending", "accepted", "rejected")
- `createdAt` (timestamp)
- `respondedAt` (timestamp, optional)

### Collection: `listings`
Document fields:
- `userId` (string)
- `userName` (string)
- `userInitials` (string)
- `title` (string)
- `description` (string)
- `location` (string)
- `monthlyRent` (number)
- `roomType` (string: "1BHK", "2BHK", "3BHK", "Shared Room")
- `lookingFor` (string: "Male", "Female", "Any")
- `lookingForCount` (number)
- `amenities` (array of strings)
- `availableFrom` (string - ISO date)
- `status` (string: "active", "filled", "inactive")
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## 6. Update Firebase Config

Open `src/app/firebase.config.ts` and replace the placeholder values with your actual Firebase config:

```typescript
export const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 7. Security Rules (Development)

For development, you can use these Firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /connectionRequests/{requestId} {
      allow read: if request.auth != null && (resource.data.fromUserId == request.auth.uid || resource.data.toUserId == request.auth.uid);
      allow create: if request.auth != null && request.resource.data.fromUserId == request.auth.uid;
      allow update: if request.auth != null && (resource.data.fromUserId == request.auth.uid || resource.data.toUserId == request.auth.uid);
    }
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 8. Switch Services

To use the Firestore services instead of in-memory services, update your component imports:

### Replace Auth Service
```typescript
// OLD
import { AuthService, User } from '../../services/auth.service';

// NEW
import { FirestoreAuthService, User } from '../../services/firestore-auth.service';
```

### Replace Connection Service
```typescript
// OLD
import { ConnectionService, ConnectionRequest } from '../../services/connection.service';

// NEW
import { FirestoreConnectionService, ConnectionRequest } from '../../services/firestore-connection.service';
```

### Replace Listing Service
```typescript
// OLD
import { ListingService } from '../../services/listing.service';

// NEW
import { FirestoreListingService } from '../../services/firestore-listing.service';
```

## 9. Run the App

```bash
ng serve
```

## Testing

1. Sign up with email/password
2. Create profile
3. Browse profiles and send connection requests
4. Post room listings
5. All data will persist in Firestore!

## Production Security Rules

For production, use stricter rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /connectionRequests/{requestId} {
      allow read: if request.auth != null && (resource.data.fromUserId == request.auth.uid || resource.data.toUserId == request.auth.uid);
      allow create: if request.auth != null && request.resource.data.fromUserId == request.auth.uid;
      allow update: if request.auth != null && resource.data.toUserId == request.auth.uid;
    }
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```
