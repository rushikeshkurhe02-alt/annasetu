export type UserRole = 'provider' | 'ngo';

export type ProviderCategory =
  | 'restaurants_cafes'
  | 'function_halls_karyalays'
  | 'caterers'
  | 'hostel_canteen'
  | 'hotels'
  | 'sweet_shops_bakeries'
  | 'others';

export interface Provider {
  id: string;
  orgName: string;
  category: ProviderCategory;
  subType: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  locality: string;
  lat: number;
  lng: number;
  verified: boolean;
  typicalSurplusTime: string;
  fssaiNumber?: string;
  about?: string;
  avatar?: string;
  createdAt: string;
}

export type NgoFocusArea =
  | 'children'
  | 'elderly'
  | 'homeless'
  | 'community_kitchen'
  | 'disaster_relief'
  | 'slum_education';

export interface Ngo {
  id: string;
  name: string;
  regNo: string;
  focusAreas: NgoFocusArea[];
  areasOfOperation: string[];
  contact: string;
  phone: string;
  email: string;
  volunteersCount: number;
  hasVehicle: boolean;
  vehicleDetails?: string;
  verified: boolean;
  about?: string;
  avatar?: string;
  createdAt: string;
}

export type PlaceType =
  | 'orphanage'
  | 'old_age_home'
  | 'shelter'
  | 'community_settlement'
  | 'other';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  locality: string;
  lat: number;
  lng: number;
  beneficiaries: number;
  mealsPerDay: number;
  needsToday: boolean;
  createdByNgoId?: string;
  reviewStatus: 'approved' | 'pending_review';
  contactPerson?: string;
  phone?: string;
  description?: string;
  imageUrl?: string;
}

export interface PlaceEnlistment {
  id: string;
  placeId: string;
  ngoId: string;
  status: 'planning' | 'active';
  updatedAt: string;
}

export type OfferStatus =
  | 'AVAILABLE'
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'COLLECTED'
  | 'SERVED'
  | 'EXPIRED'
  | 'DECLINED';

export interface Offer {
  id: string;
  providerId: string;
  items: string;
  foodType: string;
  platesTotal: number;
  platesAvailable: number;
  isVeg: boolean;
  packing: string;
  pickupFrom: string; // ISO string or time
  pickupTo: string;   // ISO string or time
  safeUntil: string;  // ISO string
  location: string;
  notes?: string;
  eventDetails?: string;
  status: OfferStatus;
  pickupCode?: string;
  allocatedNgoId?: string;
  createdAt: string;
}

export interface DistributionPlan {
  id: string;
  offerId: string;
  ngoId: string;
  placeId: string;
  beneficiaries: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'evening_snack';
  platesRequested: number;
  collectorName: string;
  collectorPhone: string;
  vehicle: string;
  pickupTime: string;
  servingTime: string;
  purposeNote?: string;
  declarationHygiene: boolean;
  declarationReport: boolean;
  status: 'submitted' | 'confirmed' | 'declined';
  declineReason?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface ServeReport {
  id: string;
  planId: string;
  offerId: string;
  ngoId: string;
  providerId: string;
  placeId: string;
  platesServed: number;
  peopleFed: number;
  servedAt: string;
  photos: string[];
  note: string;
  leftoverNote?: string;
  providerConfirmed: boolean;
  providerThanked: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  verified: boolean;
  data: Provider | Ngo;
}
