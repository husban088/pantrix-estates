export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'sale' | 'rent';
  category: string;
  price: number;
  city: string;
  area: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  featured: boolean;
  status: 'available' | 'sold' | 'rented';
  amenities: string[];
  images: string[];
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  budget: number;
  propertyId: string;
  propertyTitle: string;
  status: 'new' | 'contacted' | 'closed';
  score: number;
  grade: 'Hot' | 'Warm' | 'Cold';
  createdAt: string;
}

export interface Stats {
  totals: {
    properties: number; available: number; featured: number; inquiries: number;
    newInquiries: number; hotLeads: number; portfolioValue: number; avgSalePrice: number;
  };
  byCity: { name: string; count: number; value: number }[];
  byCategory: { name: string; count: number }[];
  byType: { name: string; count: number }[];
  byStatus: { name: string; count: number }[];
  monthly: { month: string; inquiries: number }[];
  recentInquiries: Inquiry[];
}

export interface ServiceStatus { name: string; tech: string; port: number; online: boolean }
