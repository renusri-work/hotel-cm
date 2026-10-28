import React, { useState } from 'react';
import { useChannelManager } from '../context/ChannelManagerContext';
import { X, FileSpreadsheet } from 'lucide-react';
import { Quotation } from '../types';

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessOpenQuote: (quote: Quotation) => void;
}

export const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({
  isOpen,
  onClose,
  onSuccessOpenQuote,
}) => {
  const { properties, activePropertyId, addQuotation } = useChannelManager();

  const initialProp =
    (activePropertyId !== 'all' ? properties.find((p) => p.id === activePropertyId) : null) ||
    properties[0];

  const [propertyId, setPropertyId] = useState(initialProp.id);
  const currentProp = properties.find((p) => p.id === propertyId) || properties[0];

  const [guestName, setGuestName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomTypeName, setRoomTypeName] = useState(currentProp.roomTypes[0]?.name || '');
  const [roomCount, setRoomCount] = useState(2);
  const [ratePerNight, setRatePerNight] = useState(currentProp.roomTypes[0]?.baseRate || 4000);
  const [checkIn, setCheckIn] = useState('2026-11-20');
  const [checkOut, setCheckOut] = useState('2026-11-22');
  const [validUntil, setValidUntil] = useState('2026-11-10');
  const [notes, setNotes] = useState('Includes buffet breakfast, high-speed Wi-Fi, and complimentary conference room access.');
  const [gstRatePct, setGstRatePct] = useState(12);

  if (!isOpen) return null;

  // Nights calculation
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));

  const subtotal = ratePerNight * nights * roomCount;
  const gstAmount = (subtotal * gstRatePct) / 100;
  const totalEstimate = subtotal + gstAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const created = addQuotation({
      propertyId,
      guestName: guestName.trim(),
      companyName: companyName.trim() || undefined,
      phone: phone.trim() || '+91 98000 00000',
      email: email.trim() || 'inquiry@corporate.com',
      checkIn,
      checkOut,
      nights,
      roomCount,
      roomTypeName,
      ratePerNight,
      gstRatePct,
      validUntil,
      notes,
    });

    onClose();
    onSuccessOpenQuote(created);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
              <span>Create Pro-forma Quotation / Estimate</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Issue formal corporate quotes before blocking inventory.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Property</label>
            <select
              value={propertyId}
              onChange={(e) => {
                setPropertyId(e.target.value);
                const p = properties.find((pr) => pr.id === e.target.value);
                if (p && p.roomTypes[0]) {
                  setRoomTypeName(p.roomTypes[0].name);
                  setRatePerNight(p.roomTypes[0].baseRate);
                }
              }}
              className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type === 'single_property' ? 'Single Unit Airbnb' : 'Bulk Hotel'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700">Client / Contact Person *</label>
              <input
                type="text"
                required
                placeholder="e.g. Suresh Kamath"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700">Company / Organization Name</label>
              <input
                type="text"
                placeholder="e.g. Wipro Technologies"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700">Phone</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700">Email</label>
              <input
                type="email"
                placeholder="contact@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="font-medium text-slate-700">Room Category</label>
              <select
                value={roomTypeName}
                onChange={(e) => {
                  setRoomTypeName(e.target.value);
                  const r = currentProp.roomTypes.find((item) => item.name === e.target.value);
                  if (r) setRatePerNight(r.baseRate);
                }}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
              >
                {currentProp.roomTypes.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-700">Number of Rooms</label>
              <input
                type="number"
                min={1}
                value={roomCount}
                onChange={(e) => setRoomCount(parseInt(e.target.value, 10) || 1)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700">Proposed Rate / Room / Night (₹)</label>
              <input
                type="number"
                value={ratePerNight}
                onChange={(e) => setRatePerNight(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700">Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700">Check-in Date</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700">Check-out Date ({nights} Nights)</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-700">Special Notes / Inclusions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
            />
          </div>

          {/* Pricing Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>Subtotal ({roomCount} rooms × {nights} nights):</span>
              <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated GST (12%):</span>
              <span className="font-mono">₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
              <span>Total Quotation Value:</span>
              <span className="font-mono text-indigo-600">₹{totalEstimate.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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
              Generate Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
