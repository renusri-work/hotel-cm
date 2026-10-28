import React, { useState } from 'react';
import { useChannelManager } from '../context/ChannelManagerContext';
import { Booking, BookingSource } from '../types';
import { Plus, Search, FileText, CheckCircle2, Globe, UserCheck, Calendar } from 'lucide-react';

interface BookingsManagerProps {
  onOpenNewBookingModal: () => void;
  onOpenInvoice: (booking: Booking) => void;
}

export const BookingsManager: React.FC<BookingsManagerProps> = ({
  onOpenNewBookingModal,
  onOpenInvoice,
}) => {
  const { bookings, properties, activePropertyId } = useChannelManager();
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBookings = bookings.filter((b) => {
    // Property filter
    if (activePropertyId !== 'all' && b.propertyId !== activePropertyId) {
      return false;
    }
    // Channel / Source filter
    if (sourceFilter !== 'all' && b.source !== sourceFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.guestName.toLowerCase().includes(q);
      const matchId = b.id.toLowerCase().includes(q);
      const matchPhone = b.guestPhone.toLowerCase().includes(q);
      const matchInvoice = b.invoiceNumber?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchPhone && !matchInvoice) return false;
    }
    return true;
  });

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <span>Frontdesk &amp; Reservations</span>
            <span>·</span>
            <span className="text-slate-500">Online &amp; Walk-in Bookings</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Bookings Ledger
          </h1>
        </div>

        <button
          onClick={onOpenNewBookingModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Offline Walk-in Booking</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Source Segmented Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              sourceFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Sources ({bookings.length})
          </button>
          <button
            onClick={() => setSourceFilter('Offline / Walk-in')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              sourceFilter === 'Offline / Walk-in'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Offline / Walk-ins
          </button>
          <button
            onClick={() => setSourceFilter('Goibibo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              sourceFilter === 'Goibibo'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Goibibo
          </button>
          <button
            onClick={() => setSourceFilter('Homeyhuts Direct')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              sourceFilter === 'Homeyhuts Direct'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Homeyhuts Direct
          </button>
          <button
            onClick={() => setSourceFilter('Airbnb')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              sourceFilter === 'Airbnb'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Airbnb
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest, ID, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4">Property &amp; Room</th>
                <th className="py-3 px-4">Dates &amp; Stay</th>
                <th className="py-3 px-3 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Source &amp; Sync</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">No bookings found for current filter.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "+ New Offline Walk-in Booking" to register an in-person guest.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isOffline = b.source === 'Offline / Walk-in';
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Booking ID & Invoice */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900">{b.id}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {b.invoiceNumber}
                        </div>
                      </td>

                      {/* Guest Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {b.guestName}
                          {b.guestGSTIN && (
                            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded font-mono">
                              B2B GST
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {b.guestPhone} · {b.guestState}
                        </div>
                      </td>

                      {/* Property & Room */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{b.propertyName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {b.roomTypeName} {b.roomNumber ? `(Room ${b.roomNumber})` : ''}
                        </div>
                      </td>

                      {/* Dates & Stay */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-slate-800 font-medium">
                          {b.checkIn} → {b.checkOut}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {b.nights} {b.nights === 1 ? 'night' : 'nights'} · {b.adults} adults
                        </div>
                      </td>

                      {/* Amount & Taxes */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <div className="font-bold text-slate-900">
                          {formatINR(b.totalAmount)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          GST ({b.gstRatePct}%): {formatINR(b.cgst + b.sgst + b.igst)}
                        </div>
                      </td>

                      {/* Source & Sync status */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-800">
                          {isOffline ? (
                            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <Globe className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          <span>{b.source}</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                          ✓ Synced to {b.syncedChannels.length} OTAs
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onOpenInvoice(b)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>GST Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
