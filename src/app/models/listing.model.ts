export interface Listing {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  title: string;
  description: string;
  location: string;
  monthlyRent: number;
  roomType: '1BHK' | '2BHK' | '3BHK' | 'Shared Room';
  lookingFor: 'Male' | 'Female' | 'Any';
  lookingForCount: number;
  amenities: string[];
  availableFrom: string;
  status: 'active' | 'filled' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListingData {
  title: string;
  description: string;
  location: string;
  monthlyRent: number;
  roomType: '1BHK' | '2BHK' | '3BHK' | 'Shared Room';
  lookingFor: 'Male' | 'Female' | 'Any';
  lookingForCount: number;
  amenities: string[];
  availableFrom: string;
}
