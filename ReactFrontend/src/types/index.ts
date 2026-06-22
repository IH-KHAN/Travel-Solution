export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  link?: string;
}

export interface User {
  userId: number;
  userName: string;
  email: string;
  role: string;
  phoneNumber?: string;
}

export interface TourPackage {
  packageId: number;
  packageCode: string;
  packageTitle: string;
  packagePrice: number;
  description?: string;
  isActive: boolean;
  activities?: Activity[];
}

export interface Activity {
  activityId: number;
  activityName: string;
  activityType: string;
  plannedTime: string;
  actualTime?: string;
  projectedCost: number;
  activityDescription?: string;
  details?: Record<string, unknown>;
}

export interface Hotel {
  hotelId: number;
  hotelName: string;
  accommodationType: string;
  starRating: number;
  cityArea: string;
  isActive: boolean;
}

export interface Restaurant {
  restaurantId: number;
  restaurantName: string;
  location: string;
  isOpen: boolean;
}

export interface Booking {
  bookingId: number;
  packageId: number;
  userId: number;
  travelDate: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid';
}
