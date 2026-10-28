import React, { useState } from 'react';
import { useChannelManager } from '../context/ChannelManagerContext';
import { Property, Booking, UpsellItem } from '../types';
import { X, ShieldCheck, Plus, Trash2, Calendar, User, CreditCard } from 'lucide-react';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessOpenInvoice: (booking: Booking) => void;
}

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccessOpenInvoice,
}) => {
  const { properties, activePropertyId, addOfflineBooking } = useChannelManager();

  const initialProperty =
    (activePropertyId !== 'all' ? properties.find((p) => p.id === activePropertyId) : null) ||
    properties[0];

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialProperty.id);
  const currentProp = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestGovtId, setGuestGovtId] = useState('');
  const [guestState, setGuestState] = useState(currentProp.state || 'Karnataka');
  const [guestGSTIN, setGuestGSTIN] = useState('');

  const [roomTypeName, setRoomTypeName] = useState(currentProp.roomTypes[0]?.name || '');
  const [roomNumber, setRoomNumber] = useState(currentProp.roomTypes[0]?.roomNumbers[0] || '101');

  // Dates
  const [checkIn, setCheckIn] = useState('2026-10-29');
  const [checkOut, setCheckOut] = useState('2026-10-31');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Rate & Financials
  const currentRoomObj = currentProp.roomTypes.find((r) => r.name === roomTypeName) || currentProp.roomTypes[0];
  const [baseRate, setBaseRate] = useState<number>(currentRoomObj?.baseRate || 4000);
  const [gstRatePct, setGstRatePct] = useState<number>(12);

  // Upsells
  const [upsellList, setUpsellList] = useState<UpsellItem[]>([
    { id: 'up-1', name: 'Buffet Breakfast (2 Pax)', amount: 600 },
  ]);
  const [newUpsellName, setNewUpsellName] = useState('');
  const [newUpsellAmount, setNewUpsellAmount] = useState('');

  // Payment
  const [paymentMode, setPaymentMode] = useState<Booking['paymentMode']>('UPI');
  const [advancePaid, setAdvancePaid] = useState<number>(0);

  if (!isOpen) return null;

  // Calculate nights
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));

  const stayAmount = baseRate * nights;
  const totalUpsells = upsellList.reduce((acc, u) => acc + u.amount, 0);
  const taxableSubtotal = stayAmount + totalUpsells;
  const totalGst = (taxableSubtotal * gstRatePct) / 100;
  const grandTotal = taxableSubtotal + totalGst;

  // Upsell handlers
  const handleAddUpsell = () => {
    if (!newUpsellName.trim() || !newUpsellAmount) return;
    setUpsellList((prev) => [
      ...prev,
      {
        id: `up-${Date.now()}`,
        name: newUpsellName.trim(),
        amount: parseFloat(newUpsellAmount) || 0,
      },
    ]);
    setNewUpsellName('');
    setNewUpsellAmount('');
  };

  const handleRemoveUpsell = (id: string) => {
    setUpsellList((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const createdBooking = addOfflineBooking({
      propertyId: selectedPropertyId,
      source: 'Offline / Walk-in',
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim() || '+91 90000 00000',
      guestEmail: guestEmail.trim() || 'guest@walkin.com',
      guestGovtId: guestGovtId.trim() || 'Govt ID Verified',
      guestGSTIN: guestGSTIN.trim() || undefined,
      guestState: guestState.trim() || currentProp.state,
      roomTypeName,
      roomNumber,
      checkIn,
      checkOut,
      nights,
      adults,
      children,
      status: 'confirmed',
      baseRatePerNight: baseRate,
      stayAmount,
      upsellAmount: totalUpsells,
      upsellItems: upsellList,
      gstRatePct,
      advancePaid: advancePaid > 0 ? advancePaid : grandTotal,
      paymentMode,
      paymentStatus: advancePaid >= grandTotal ? 'paid' : advancePaid > 0 ? 'partial' : 'unpaid',
    });

    onClose();
    onSuccessOpenInvoice(createdBooking);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Create Offline / Walk-in Booking</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Instantly blocks inventory on Goibibo, Airbnb, and all channels.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Property Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Property / Client</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                const p = properties.find((prop) => prop.id === e.target.value);
                if (p && p.roomTypes[0]) {
                  setRoomTypeName(p.roomTypes[0].name);
                  setBaseRate(p.roomTypes[0].baseRate);
                  setRoomNumber(p.roomTypes[0].roomNumbers[0] || '101');
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type === 'single_property' ? 'Single Airbnb Unit' : 'Bulk Multi-Room Hotel'})
                </option>
              ))}
            </select>
          </div>

          {/* Section: Guest Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Guest &amp; Billing Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700">Primary Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Mobile Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Govt ID Proof (Aadhaar / Passport)</label>
                <input
                  type="text"
                  placeholder="Aadhaar / Passport / DL No."
                  value={guestGovtId}
                  onChange={(e) => setGuestGovtId(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Guest State (For GST Slabs)</label>
                <input
                  type="text"
                  placeholder="e.g. Karnataka, Maharashtra"
                  value={guestState}
                  onChange={(e) => setGuestState(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Guest GSTIN (Optional for B2B ITC)</label>
                <input
                  type="text"
                  placeholder="e.g. 29AAAAA0000A1Z5"
                  value={guestGSTIN}
                  onChange={(e) => setGuestGSTIN(e.target.value.toUpperCase())}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Room & Dates */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Stay &amp; Inventory Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700">Room Category</label>
                <select
                  value={roomTypeName}
                  onChange={(e) => {
                    setRoomTypeName(e.target.value);
                    const r = currentProp.roomTypes.find((item) => item.name === e.target.value);
                    if (r) {
                      setBaseRate(r.baseRate);
                      setRoomNumber(r.roomNumbers[0] || '101');
                    }
                  }}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {currentProp.roomTypes.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} (Base ₹{r.baseRate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Allocated Room / Unit #</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Check-in Date</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Check-out Date ({nights} Nights)</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Nightly Rate (₹)</label>
                <input
                  type="number"
                  value={baseRate}
                  onChange={(e) => setBaseRate(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">GST Slab (%)</label>
                <select
                  value={gstRatePct}
                  onChange={(e) => setGstRatePct(parseInt(e.target.value, 10))}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value={12}>12% (Standard Hotel Room &lt; ₹7,500)</option>
                  <option value={18}>18% (Luxury Room &gt; ₹7,500)</option>
                  <option value={0}>0% (Exempt)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Extra Services / Upsells */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Upsell &amp; Ancillary Services
              </span>
              <span className="text-slate-500">Food, airport cab, extra bed</span>
            </div>

            <div className="space-y-2">
              {upsellList.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="font-medium text-slate-800">{u.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">₹{u.amount}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUpsell(u.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Service name (e.g. Airport Taxi, Laundry)"
                  value={newUpsellName}
                  onChange={(e) => setNewUpsellName(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Amount ₹"
                  value={newUpsellAmount}
                  onChange={(e) => setNewUpsellAmount(e.target.value)}
                  className="w-28 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUpsell}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Section: Payment & Grand Total */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Billing Summary &amp; Payment</span>
            </div>

            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Room Stay ({nights} nights × ₹{baseRate}):</span>
                <span className="font-mono">₹{stayAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Ancillary Upsells:</span>
                <span className="font-mono">₹{totalUpsells.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax ({gstRatePct}%):</span>
                <span className="font-mono">₹{totalGst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900 text-sm">
                <span>Grand Total:</span>
                <span className="font-mono text-indigo-600">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-medium text-slate-700">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as Booking['paymentMode'])}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash at Frontdesk</option>
                  <option value="Card">Credit / Debit Card (POS)</option>
                  <option value="Net Banking">Net Banking / NEFT</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Advance Paid (₹)</label>
                <input
                  type="number"
                  placeholder={`Full payment ₹${grandTotal}`}
                  value={advancePaid || ''}
                  onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Instant 2-way sync promise notice */}
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-start gap-2.5 text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">2-Way Sync Engine Active:</span> Clicking
              "Confirm &amp; Block Channels" will automatically transmit block commands to Goibibo, Airbnb, and all OTAs in real time.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs"
            >
              Confirm Booking &amp; Generate Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
