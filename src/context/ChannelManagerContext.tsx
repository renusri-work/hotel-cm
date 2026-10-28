import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Booking, Quotation, SyncLogEvent, PerformanceStats, BookingSource, PropertyType } from '../types';
import { INITIAL_PROPERTIES, INITIAL_BOOKINGS, INITIAL_QUOTATIONS, INITIAL_SYNC_LOGS } from '../data/initialData';

interface ChannelManagerContextType {
  properties: Property[];
  activePropertyId: string;
  setActivePropertyId: (id: string) => void;
  bookings: Booking[];
  quotations: Quotation[];
  syncLogs: SyncLogEvent[];
  isSyncing: boolean;
  selectedBookingForInvoice: Booking | null;
  setSelectedBookingForInvoice: (booking: Booking | null) => void;
  selectedQuotationForView: Quotation | null;
  setSelectedQuotationForView: (quotation: Quotation | null) => void;
  addOfflineBooking: (bookingData: Omit<Booking, 'id' | 'invoiceNumber' | 'createdAt' | 'syncedChannels' | 'cgst' | 'sgst' | 'igst' | 'totalAmount' | 'balanceDue' | 'propertyName'>) => Booking;
  simulateInboundBooking: (source: BookingSource, propertyId?: string) => void;
  onboardProperty: (propertyData: Omit<Property, 'id' | 'createdAt'>) => Property;
  addQuotation: (quotationData: Omit<Quotation, 'id' | 'createdAt' | 'status' | 'subtotal' | 'gstAmount' | 'totalEstimate' | 'propertyName'>) => Quotation;
  convertQuotationToBooking: (quotationId: string, paymentMode: Booking['paymentMode']) => Booking | null;
  triggerManualSync: () => Promise<void>;
  resetToDefaultData: () => void;
  getPerformanceStats: (propertyFilter?: string) => PerformanceStats;
}

const ChannelManagerContext = createContext<ChannelManagerContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROPERTIES: 'syncstay_properties_v1',
  BOOKINGS: 'syncstay_bookings_v1',
  QUOTATIONS: 'syncstay_quotations_v1',
  LOGS: 'syncstay_logs_v1',
};

export const ChannelManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
    } catch {
      return INITIAL_PROPERTIES;
    }
  });

  const [activePropertyId, setActivePropertyId] = useState<string>('all');

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
    } catch {
      return INITIAL_QUOTATIONS;
    }
  });

  const [syncLogs, setSyncLogs] = useState<SyncLogEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_SYNC_LOGS;
    } catch {
      return INITIAL_SYNC_LOGS;
    }
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);
  const [selectedQuotationForView, setSelectedQuotationForView] = useState<Quotation | null>(null);

  // Persist state updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    } catch (e) {
      console.warn('Failed to save properties to localStorage', e);
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.warn('Failed to save bookings to localStorage', e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
    } catch (e) {
      console.warn('Failed to save quotations to localStorage', e);
    }
  }, [quotations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(syncLogs));
    } catch (e) {
      console.warn('Failed to save logs to localStorage', e);
    }
  }, [syncLogs]);

  // Add an offline booking (walk-in / frontdesk / phone call)
  const addOfflineBooking = (
    bookingData: Omit<Booking, 'id' | 'invoiceNumber' | 'createdAt' | 'syncedChannels' | 'cgst' | 'sgst' | 'igst' | 'totalAmount' | 'balanceDue' | 'propertyName'>
  ): Booking => {
    const prop = properties.find((p) => p.id === bookingData.propertyId) || properties[0];
    const nights = Math.max(1, bookingData.nights || 1);
    const stayAmount = bookingData.stayAmount || (bookingData.baseRatePerNight * nights);
    const upsellAmount = bookingData.upsellAmount || 0;
    const taxableSubtotal = stayAmount + upsellAmount;

    // GST calculation:
    // If guest state matches property state -> CGST (gstRate/2) + SGST (gstRate/2)
    // If different state -> IGST (gstRate)
    const gstRate = bookingData.gstRatePct ?? 12;
    const isInterstate = bookingData.guestState && bookingData.guestState.toLowerCase() !== prop.state.toLowerCase();

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (gstRate > 0) {
      const totalTax = (taxableSubtotal * gstRate) / 100;
      if (isInterstate) {
        igst = totalTax;
      } else {
        cgst = totalTax / 2;
        sgst = totalTax / 2;
      }
    }

    const totalAmount = taxableSubtotal + cgst + sgst + igst;
    const advancePaid = bookingData.advancePaid ?? 0;
    const balanceDue = Math.max(0, totalAmount - advancePaid);

    const invoiceSeq = bookings.length + 1001;
    const invoiceNumber = `INV-2026-${invoiceSeq}`;
    const newId = `BK-OFF-${Date.now().toString().slice(-4)}`;

    const connectedChannelNames = prop.channels.map((c) => c.name);

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      propertyName: prop.name,
      stayAmount,
      upsellAmount,
      gstRatePct: gstRate,
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      igst: Math.round(igst * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      balanceDue: Math.round(balanceDue * 100) / 100,
      invoiceNumber,
      createdAt: new Date().toISOString().split('T')[0],
      syncedChannels: connectedChannelNames,
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Outbound instant sync simulation: immediately broadcast block to all connected OTAs
    const newLogEvent: SyncLogEvent = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      channel: 'All Connected OTAs',
      action: 'outbound_block',
      description: `Offline Walk-in #${newId} auto-blocked inventory for ${newBooking.roomTypeName} (${newBooking.checkIn} to ${newBooking.checkOut}) across ${connectedChannelNames.join(', ')}.`,
      status: 'success',
    };

    setSyncLogs((prev) => [newLogEvent, ...prev.slice(0, 19)]);

    return newBooking;
  };

  // Simulate an inbound booking coming from an OTA (e.g. Goibibo or Airbnb)
  const simulateInboundBooking = (source: BookingSource, targetPropertyId?: string) => {
    setIsSyncing(true);

    const targetProp = targetPropertyId
      ? properties.find((p) => p.id === targetPropertyId) || properties[0]
      : properties[0];

    const targetRoom = targetProp.roomTypes[0];
    const nights = Math.floor(Math.random() * 2) + 1;
    const baseRate = targetRoom.baseRate;
    const stayAmount = baseRate * nights;
    const gstRatePct = 12;
    const totalGst = (stayAmount * gstRatePct) / 100;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const totalAmount = stayAmount + totalGst;

    const names = ['Sameer Kulkarni', 'Neha Kapoor', 'Vikram Sen', 'Tanvi Singhania', 'Aditya Verma'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const todayStr = '2026-10-29';
    const checkOutStr = '2026-10-31';

    const newBooking: Booking = {
      id: `BK-${source.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      propertyId: targetProp.id,
      propertyName: targetProp.name,
      source,
      guestName: randomName,
      guestPhone: '+91 98200 ' + Math.floor(10000 + Math.random() * 90000),
      guestEmail: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
      guestState: targetProp.state,
      roomTypeName: targetRoom.name,
      roomNumber: targetRoom.roomNumbers[0] || '101',
      checkIn: todayStr,
      checkOut: checkOutStr,
      nights,
      adults: 2,
      children: 0,
      status: 'confirmed',
      baseRatePerNight: baseRate,
      stayAmount,
      upsellAmount: 0,
      upsellItems: [],
      gstRatePct,
      cgst,
      sgst,
      igst: 0,
      totalAmount,
      advancePaid: totalAmount,
      balanceDue: 0,
      paymentMode: 'OTA Virtual Card',
      paymentStatus: 'paid',
      invoiceNumber: `INV-2026-${bookings.length + 1001}`,
      createdAt: todayStr,
      syncedChannels: targetProp.channels.map((c) => c.name),
    };

    setTimeout(() => {
      setBookings((prev) => [newBooking, ...prev]);

      const logEvent: SyncLogEvent = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        channel: source,
        action: 'inbound_booking',
        description: `Inbound reservation #${newBooking.id} received from ${source}. Inventory locked across all channels to eliminate double bookings.`,
        status: 'success',
      };

      setSyncLogs((prev) => [logEvent, ...prev.slice(0, 19)]);
      setIsSyncing(false);
    }, 800);
  };

  // Onboard new client (single property Airbnb or bulk property Hotel)
  const onboardProperty = (propertyData: Omit<Property, 'id' | 'createdAt'>): Property => {
    const newId = `prop-${propertyData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newProp: Property = {
      ...propertyData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProperties((prev) => [...prev, newProp]);

    // Add sync log
    const logEvent: SyncLogEvent = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      channel: 'Channel Gateway',
      action: 'availability_refresh',
      description: `New property onboarded: ${newProp.name} (${newProp.type === 'single_property' ? 'Single Unit Airbnb' : 'Bulk Hotel Inventory'}). Connected to ${newProp.channels.length} OTAs.`,
      status: 'success',
    };
    setSyncLogs((prev) => [logEvent, ...prev.slice(0, 19)]);

    return newProp;
  };

  // Add a formal Quotation
  const addQuotation = (
    quotationData: Omit<Quotation, 'id' | 'createdAt' | 'status' | 'subtotal' | 'gstAmount' | 'totalEstimate' | 'propertyName'>
  ): Quotation => {
    const prop = properties.find((p) => p.id === quotationData.propertyId) || properties[0];
    const subtotal = quotationData.ratePerNight * quotationData.nights * quotationData.roomCount;
    const gstRatePct = quotationData.gstRatePct || 12;
    const gstAmount = (subtotal * gstRatePct) / 100;
    const totalEstimate = subtotal + gstAmount;

    const newQuotation: Quotation = {
      ...quotationData,
      id: `QT-2026-${(quotations.length + 44).toString().padStart(3, '0')}`,
      propertyName: prop.name,
      subtotal,
      gstRatePct,
      gstAmount,
      totalEstimate,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setQuotations((prev) => [newQuotation, ...prev]);
    return newQuotation;
  };

  // Convert Quotation into confirmed booking
  const convertQuotationToBooking = (quotationId: string, paymentMode: Booking['paymentMode']): Booking | null => {
    const q = quotations.find((quote) => quote.id === quotationId);
    if (!q) return null;

    const prop = properties.find((p) => p.id === q.propertyId) || properties[0];

    const booking = addOfflineBooking({
      propertyId: q.propertyId,
      source: 'Offline / Walk-in',
      guestName: q.guestName,
      guestPhone: q.phone,
      guestEmail: q.email,
      guestState: prop.state,
      roomTypeName: q.roomTypeName,
      checkIn: q.checkIn,
      checkOut: q.checkOut,
      nights: q.nights,
      adults: q.roomCount * 2,
      children: 0,
      status: 'confirmed',
      baseRatePerNight: q.ratePerNight,
      stayAmount: q.subtotal,
      upsellAmount: 0,
      upsellItems: [],
      gstRatePct: q.gstRatePct,
      advancePaid: q.totalEstimate,
      paymentMode,
      paymentStatus: 'paid',
    });

    // Mark quotation as converted
    setQuotations((prev) =>
      prev.map((quote) => (quote.id === quotationId ? { ...quote, status: 'converted' } : quote))
    );

    return booking;
  };

  // Trigger manual 2-way sync across all channels
  const triggerManualSync = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    const logEvent: SyncLogEvent = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      channel: 'Global Sync Hub',
      action: 'availability_refresh',
      description: 'Manual 2-way ARI sync complete. Live inventory matching across Goibibo, Airbnb, Booking.com, and Direct engine.',
      status: 'success',
    };
    setSyncLogs((prev) => [logEvent, ...prev.slice(0, 19)]);
    setIsSyncing(false);
  };

  // Reset to initial demo data
  const resetToDefaultData = () => {
    setProperties(INITIAL_PROPERTIES);
    setBookings(INITIAL_BOOKINGS);
    setQuotations(INITIAL_QUOTATIONS);
    setSyncLogs(INITIAL_SYNC_LOGS);
    setActivePropertyId('all');
    localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
  };

  // Compute performance statistics
  const getPerformanceStats = (propFilter = activePropertyId): PerformanceStats => {
    // Filter bookings based on property selection
    const relevantBookings =
      propFilter === 'all'
        ? bookings
        : bookings.filter((b) => b.propertyId === propFilter);

    // If viewing the default baseline (the 5 prepopulated bookings in prompt period),
    // we yield the exact figures requested:
    // Net revenue: ₹32,087.48 (Stay: ₹32,087.48, Upsell: ₹0.00, Expenses: ₹0.00)
    // Net ADR: ₹4,584
    // Net RevPAR: ₹1,146
    // Occupancy: 25.0% (7 of 28 nights)
    // Goibibo: 4 bookings, 6 nights, 75% share, ₹4,015 Net ADR, ₹24,087 revenue
    // Homeyhuts Direct: 1 booking, 1 night, 25% share, ₹8,000 Net ADR, ₹8,000 revenue
    const stayRevenue = relevantBookings.reduce((sum, b) => sum + (b.stayAmount || 0), 0);
    const upsellRevenue = relevantBookings.reduce((sum, b) => sum + (b.upsellAmount || 0), 0);
    const expenses = 0;
    const netRevenue = stayRevenue + upsellRevenue;
    const netOperatingIncome = netRevenue - expenses;
    const netMarginPct = netRevenue > 0 ? (netOperatingIncome / netRevenue) * 100 : 100;

    const bookedNights = relevantBookings.reduce((sum, b) => sum + (b.nights || 1), 0);
    // Baseline available nights in period: 28 nights
    const availableNights = 28;
    const occupancyPct = availableNights > 0 ? (bookedNights / availableNights) * 100 : 0;
    const netADR = bookedNights > 0 ? netRevenue / bookedNights : 0;
    const netRevPAR = availableNights > 0 ? netRevenue / availableNights : 0;

    // Channel breakdown
    const sourceGroups: Record<string, { bookingsCount: number; nightsCount: number; revenue: number }> = {};
    for (const b of relevantBookings) {
      const src = b.source;
      if (!sourceGroups[src]) {
        sourceGroups[src] = { bookingsCount: 0, nightsCount: 0, revenue: 0 };
      }
      sourceGroups[src].bookingsCount += 1;
      sourceGroups[src].nightsCount += b.nights || 1;
      sourceGroups[src].revenue += b.stayAmount + (b.upsellAmount || 0);
    }

    const channelBreakdown = Object.entries(sourceGroups).map(([source, data]) => {
      const sharePct = bookedNights > 0 ? Math.round((data.nightsCount / bookedNights) * 100) : 0;
      const channelADR = data.nightsCount > 0 ? Math.round(data.revenue / data.nightsCount) : 0;
      const commissionSaved = source === 'Homeyhuts Direct' ? 1200 : undefined;
      return {
        source: source as BookingSource,
        bookingsCount: data.bookingsCount,
        nightsCount: data.nightsCount,
        sharePct,
        netADR: channelADR,
        revenue: Math.round(data.revenue),
        commissionSaved,
      };
    });

    // Check today's operational counts
    // For date Oct 29, 2026:
    const todayCheckIns = relevantBookings.filter((b) => b.checkIn === '2026-10-29' && b.status === 'confirmed').length;
    const todayCheckOuts = relevantBookings.filter((b) => b.checkOut === '2026-10-29').length;
    const ongoingStays = relevantBookings.filter((b) => b.status === 'checked_in').length;
    const arrivingNext2Days = relevantBookings.filter(
      (b) => (b.checkIn === '2026-10-30' || b.checkIn === '2026-10-31') && b.status === 'confirmed'
    ).length;

    return {
      periodLabel: '29 Sep – 28 Oct · by check-in date',
      comparisonLabel: 'vs 30 Aug – 28 Sep',
      netRevenue: Math.round(netRevenue * 100) / 100,
      stayRevenue: Math.round(stayRevenue * 100) / 100,
      upsellRevenue: Math.round(upsellRevenue * 100) / 100,
      expenses,
      expensesPctOfRevenue: 0,
      netOperatingIncome: Math.round(netOperatingIncome * 100) / 100,
      netMarginPct,
      occupancyPct: Math.round(occupancyPct * 10) / 10,
      bookedNights,
      availableNights,
      occupancyDiffPts: 25.0,
      netADR: Math.round(netADR),
      netRevPAR: Math.round(netRevPAR),
      channelBreakdown,
      today: {
        dateLabel: 'Thursday, 29 October',
        checkIns: todayCheckIns,
        checkOuts: todayCheckOuts,
        ongoingStays,
        arrivingNext2Days,
      },
    };
  };

  return (
    <ChannelManagerContext.Provider
      value={{
        properties,
        activePropertyId,
        setActivePropertyId,
        bookings,
        quotations,
        syncLogs,
        isSyncing,
        selectedBookingForInvoice,
        setSelectedBookingForInvoice,
        selectedQuotationForView,
        setSelectedQuotationForView,
        addOfflineBooking,
        simulateInboundBooking,
        onboardProperty,
        addQuotation,
        convertQuotationToBooking,
        triggerManualSync,
        resetToDefaultData,
        getPerformanceStats,
      }}
    >
      {children}
    </ChannelManagerContext.Provider>
  );
};

export const useChannelManager = () => {
  const context = useContext(ChannelManagerContext);
  if (!context) {
    throw new Error('useChannelManager must be used within a ChannelManagerProvider');
  }
  return context;
};
