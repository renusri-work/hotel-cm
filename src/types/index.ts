export type PropertyType = 'single_property' | 'bulk_property';

export interface RoomTypeConfig {
  id: string;
  name: string;
  category: string;
  baseRate: number;
  totalUnits: number;
  maxGuests: number;
  roomNumbers: string[];
}

export interface ConnectedChannel {
  id: string;
  name: string;
  status: 'active' | 'synced' | 'paused';
  commissionPct: number;
  lastSync: string;
  syncType: '2-way Instant API' | 'iCal / XML';
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType; // 'single_property' for Airbnb, 'bulk_property' for Hotels
  category: string; // e.g. "Airbnb Luxury Villa" or "3-Star Boutique Hotel"
  city: string;
  state: string;
  pincode: string;
  address: string;
  gstin: string;
  hsnSacCode: string; // usually 996311 for room accommodation
  contactPhone: string;
  contactEmail: string;
  totalUnits: number;
  roomTypes: RoomTypeConfig[];
  channels: ConnectedChannel[];
  createdAt: string;
}

export type BookingSource =
  | 'Goibibo'
  | 'Homeyhuts Direct'
  | 'Airbnb'
  | 'Booking.com'
  | 'MakeMyTrip'
  | 'Offline / Walk-in';

export interface UpsellItem {
  id: string;
  name: string;
  amount: number;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  source: BookingSource;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestGovtId?: string;
  guestGSTIN?: string; // For B2B GST invoices
  guestState: string;
  roomTypeName: string;
  roomNumber?: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  adults: number;
  children: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  baseRatePerNight: number;
  stayAmount: number;
  upsellAmount: number;
  upsellItems: UpsellItem[];
  gstRatePct: number; // 0, 12, or 18%
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Net Banking' | 'OTA Virtual Card';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  invoiceNumber: string;
  createdAt: string;
  syncedChannels: string[];
}

export interface Quotation {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  companyName?: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomCount: number;
  roomTypeName: string;
  ratePerNight: number;
  subtotal: number;
  gstRatePct: number;
  gstAmount: number;
  totalEstimate: number;
  validUntil: string;
  notes: string;
  status: 'active' | 'converted' | 'expired';
  createdAt: string;
}

export interface InventoryCell {
  date: string;
  roomId: string;
  roomTypeName: string;
  available: number;
  total: number;
  rate: number;
  isStopSell: boolean;
  minStay: number;
}

export interface SyncLogEvent {
  id: string;
  timestamp: string;
  channel: string;
  action: 'outbound_block' | 'inbound_booking' | 'rate_update' | 'availability_refresh';
  description: string;
  status: 'success' | 'syncing' | 'pending';
}

export interface PerformanceStats {
  periodLabel: string;
  comparisonLabel: string;
  netRevenue: number;
  stayRevenue: number;
  upsellRevenue: number;
  expenses: number;
  expensesPctOfRevenue: number;
  netOperatingIncome: number;
  netMarginPct: number;
  occupancyPct: number;
  bookedNights: number;
  availableNights: number;
  occupancyDiffPts: number;
  netADR: number;
  netRevPAR: number;
  channelBreakdown: Array<{
    source: BookingSource;
    bookingsCount: number;
    nightsCount: number;
    sharePct: number;
    netADR: number;
    revenue: number;
    commissionSaved?: number;
  }>;
  today: {
    dateLabel: string;
    checkIns: number;
    checkOuts: number;
    ongoingStays: number;
    arrivingNext2Days: number;
  };
}
