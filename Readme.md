# Roomie Find - Roommate Finder Application

A modern web application for finding roommates and room listings in Warangal/Hanamkonda area. Built with Angular 17 and Firebase Firestore.

## Features

- **User Profiles**: Create and browse detailed roommate profiles with preferences, budget, and bio
- **Room Listings**: Post and browse room listings with rent, amenities, and availability
- **Connection System**: Send connection requests to potential roommates
- **Real-time Messaging**: Chat with matched connections
- **Contact Info**: View email and phone of matched roommates
- **Privacy Controls**: Toggle profile visibility

## Tech Stack

- **Frontend**: Angular 17 (Standalone Components)
- **Styling**: Tailwind CSS
- **Backend**: Firebase Firestore (Realtime Database)
- **Authentication**: Firebase Auth

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd roomie-find
   npm install
   ```
3. Run the development server:
   ```bash
   npx ng serve
   ```
4. Open http://localhost:4200 in your browser

## Test User Credentials

Use these accounts to test the application:

| Email | Password | Role |
|-------|----------|------|
| rajs@gmail.com | 123456 | Test User 1 |
| kenb@gmail.com | 123456 | Test User 2 |

### Testing Flow

1. **Sign In**: Use one of the test accounts above
2. **Browse Profiles**: View other users' profiles in "Browse Roommates"
3. **Send Request**: Click "Connect" to send a connection request
4. **Switch User**: Sign out and sign in with the other test account
5. **Accept Request**: Go to "My Connections" → "Received" tab and accept the request
6. **Message**: Once matched, click "Message" to open the chat
7. **View Contact**: In "My Connections" → "Matches" tab, view email and phone

## Application Structure

### Pages

- `/` - Home/Landing page
- `/sign-in` - User authentication
- `/sign-up` - User registration
- `/create-profile` - Profile creation/editing
- `/browse-profiles` - Browse roommate profiles
- `/browse-listings` - Browse room listings
- `/my-listings` - Manage your room listings
- `/connections` - Connection requests and matches
- `/chat/:userId` - Real-time chat with matched users

### Services

- `FirestoreAuthService` - Authentication and user management
- `FirestoreListingService` - Room listings CRUD
- `FirestoreConnectionService` - Connection requests and matches
- `FirestoreMessageService` - Real-time messaging

## Firestore Collections

- `users` - User profiles
- `listings` - Room listings
- `connectionRequests` - Connection requests between users
- `messages` - Chat messages

## Deployment

Build for production:
```bash
npx ng build --configuration production
```

## License

This project is for educational purposes.
