// src/pages/Landing/utils/constants.ts
import { HeroData, RoomType, Facility, KosProperty, TestimonialItem, ContactInfo } from '../types';

export const KOS_PROPERTY: KosProperty = {
  name: "POTUNA KOS",
  tagline: "Kos Nyaman di Jagakarsa",
  description: "Kos nyaman untuk mahasiswa dengan fasilitas lengkap di Jagakarsa, Jakarta Selatan. Lokasi strategis dekat UI dan stasiun.",
  owner: {
    name: "Potuna Kos Management",
    phone: "+62-21-12345678",
    whatsapp: "6221123456789",
    email: "info@potunakos.com"
  },
  location: {
    address: "Jl. Raya Jagakarsa No. 123",
    city: "Jakarta Selatan",
    district: "Jagakarsa",
    googleMapsUrl: "https://maps.google.com/jagakarsa-potuna-kos",
    nearbyPlaces: [
      "Universitas Indonesia (10 menit)",
      "Stasiun Lenteng Agung (5 menit)",
      "Mall Margocity (15 menit)"
    ]
  },
  images: {
    hero: ["/images/hero-placeholder.jpg"],
    rooms: ["/images/room-placeholder.jpg"],
    facilities: ["/images/facility-placeholder.jpg"],
    common: ["/images/common-placeholder.jpg"]
  }
};

export const HERO_DATA: HeroData = {
  title: "POTUNA KOS",
  subtitle: "Kos Nyaman di Jagakarsa untuk Mahasiswa",
  description: "Hunian nyaman dengan fasilitas lengkap di lokasi strategis Jagakarsa. Dekat UI, stasiun, dan pusat perbelanjaan.",
  primaryCTA: {
    text: "Book Sekarang",
    action: "booking"
  },
  secondaryCTA: {
    text: "Lihat Virtual",
    action: "virtual-tour"
  },
  quickInfo: {
    startingPrice: 1000000,
    availableRooms: 12,
    location: "Jagakarsa",
    rating: 4.9
  }
};

export const ROOM_TYPES: RoomType[] = [
  {
    id: "standard",
    name: "Kamar Standard",
    price: 1000000,
    deposit: 1000000,
    size: "3x3 meter",
    capacity: 1,
    available: 6,
    total: 15,
    images: ["/images/room-placeholder.jpg"],
    facilities: [
      "WiFi",
      "Kasur",
      "Lemari",
      "Kamar Mandi Luar"
    ],
    description: "Kamar nyaman dengan fasilitas dasar untuk mahasiswa."
  },
  {
    id: "premium",
    name: "Kamar Premium",
    price: 1500000,
    deposit: 1500000,
    size: "3x4 meter",
    capacity: 1,
    available: 6,
    total: 15,
    images: ["/images/room-placeholder.jpg"],
    facilities: [
      "AC",
      "WiFi",
      "Kasur",
      "Lemari",
      "Kamar Mandi Dalam"
    ],
    description: "Kamar dengan AC dan kamar mandi dalam untuk kenyamanan lebih."
  }
];

export const FACILITIES: Facility[] = [
  {
    id: "wifi",
    name: "WiFi Internet",
    icon: "Wifi",
    category: "room",
    available: true,
    description: "Configure your actual facilities"
  },
  {
    id: "parking",
    name: "Parking Area",
    icon: "Car",
    category: "building",
    available: true,
    description: "Add your building facilities"
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  // Add real testimonials here or leave empty
  // Remove placeholder testimonials
];

export const CONTACT_INFO: ContactInfo = {
  whatsapp: "6221123456789",
  phone: "+62-21-12345678",
  email: "info@potunakos.com",
  address: "Jl. Raya Jagakarsa No. 123, Jagakarsa, Jakarta Selatan",
  operatingHours: {
    weekdays: "08:00 - 20:00",
    weekends: "09:00 - 17:00"
  }
};