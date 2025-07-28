// src/pages/Landing/types/landing.types.ts
export interface KosProperty {
  name: string;
  tagline: string;
  description: string;
  owner: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
  };
  location: {
    address: string;
    city: string;
    district: string;
    googleMapsUrl: string;
    nearbyPlaces: string[];
  };
  images: {
    hero: string[];
    rooms: string[];
    facilities: string[];
    common: string[];
  };
}

export interface RoomType {
  id: string;
  name: string;
  price: number;
  deposit: number;
  size: string;
  capacity: number;
  available: number;
  total: number;
  images: string[];
  facilities: string[];
  description: string;
  featured?: boolean;
}

export interface Facility {
  id: string;
  name: string;
  icon: string;
  category: 'room' | 'shared' | 'building' | 'location';
  description?: string;
  available: boolean;
}

export interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  primaryCTA: {
    text: string;
    action: string;
  };
  secondaryCTA: {
    text: string;
    action: string;
  };
  quickInfo: {
    startingPrice: number;
    availableRooms: number;
    location: string;
    rating: number;
  };
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  duration: string;
}

export interface ContactInfo {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  operatingHours: {
    weekdays: string;
    weekends: string;
  };
}