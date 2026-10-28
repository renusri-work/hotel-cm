import React, { useState } from 'react';
import { useChannelManager } from '../context/ChannelManagerContext';
import { PropertyType, RoomTypeConfig, ConnectedChannel } from '../types';
import { X, Building2, Home, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface OnboardPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardPropertyModal: React.FC<OnboardPropertyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { onboardProperty } = useChannelManager();

  const [propertyType, setPropertyType] = useState<PropertyType>('single_property');
  const [propertyName, setPropertyName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Single Property (Airbnb) fields
  const [singleBaseRate, setSingleBaseRate] = useState<number>(7500);
  const [singleMaxGuests, setSingleMaxGuests] = useState<number>(6);
  const [singleUnitTitle, setSingleUnitTitle] = useState('Entire 2BHK Holiday Villa');

  // Bulk Property (Hotel) fields
  const [bulkRoomTypes, setBulkRoomTypes] = useState<Array<{ name: string; category: string; baseRate: number; units: number; maxGuests: number }>>([
    { name: 'Deluxe Room', category: 'Deluxe', baseRate: 3500, units: 10, maxGuests: 2 },
    { name: 'Executive Suite', category: 'Suite', baseRate: 5500, units: 4, maxGuests: 3 },
  ]);

  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomRate, setNewRoomRate] = useState('');
  const [newRoomUnits, setNewRoomUnits] = useState('5');

  // Connected channels selection
  const [enableGoibibo, setEnableGoibibo] = useState(true);
  const [enableAirbnb, setEnableAirbnb] = useState(true);
  const [enableBookingCom, setEnableBookingCom] = useState(true);
  const [enableDirect, setEnableDirect] = useState(true);

  if (!isOpen) return null;

  const handleAddBulkRoom = () => {
    if (!newRoomName.trim() || !newRoomRate) return;
    setBulkRoomTypes((prev) => [
      ...prev,
      {
        name: newRoomName.trim(),
        category: 'Standard',
        baseRate: parseFloat(newRoomRate) || 3000,
        units: parseInt(newRoomUnits, 10) || 5,
        maxGuests: 2,
      },
    ]);
    setNewRoomName('');
    setNewRoomRate('');
    setNewRoomUnits('5');
  };

  const handleRemoveBulkRoom = (index: number) => {
    setBulkRoomTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName.trim()) return;

    // Configure rooms
    let roomTypesConfig: RoomTypeConfig[] = [];
    let totalUnits = 1;

    if (propertyType === 'single_property') {
      totalUnits = 1;
      roomTypesConfig = [
        {
          id: `rt-single-${Date.now()}`,
          name: singleUnitTitle.trim() || 'Entire Unit',
          category: 'Entire Home / Villa',
          baseRate: singleBaseRate,
          totalUnits: 1,
          maxGuests: singleMaxGuests,
          roomNumbers: ['Unit 1 (Full Home)'],
        },
      ];
    } else {
      totalUnits = bulkRoomTypes.reduce((sum, r) => sum + r.units, 0);
      let roomCounter = 101;
      roomTypesConfig = bulkRoomTypes.map((r, idx) => {
        const roomNumbers = Array.from({ length: r.units }).map(() => (roomCounter++).toString());
        return {
          id: `rt-bulk-${idx}-${Date.now()}`,
          name: r.name,
          category: r.category,
          baseRate: r.baseRate,
          totalUnits: r.units,
          maxGuests: r.maxGuests,
          roomNumbers,
        };
      });
    }

    // Configure connected channels
    const channels: ConnectedChannel[] = [];
    if (enableGoibibo) {
      channels.push({
        id: `ch-goibibo-${Date.now()}`,
        name: 'Goibibo / MMT',
        status: 'active',
        commissionPct: 15,
        lastSync: 'Just now',
        syncType: '2-way Instant API',
      });
    }
    if (enableAirbnb) {
      channels.push({
        id: `ch-airbnb-${Date.now()}`,
        name: 'Airbnb',
        status: 'active',
        commissionPct: 14,
        lastSync: 'Just now',
        syncType: '2-way Instant API',
      });
    }
    if (enableBookingCom) {
      channels.push({
        id: `ch-booking-${Date.now()}`,
        name: 'Booking.com',
        status: 'active',
        commissionPct: 15,
        lastSync: 'Just now',
        syncType: '2-way Instant API',
      });
    }
    if (enableDirect) {
      channels.push({
        id: `ch-direct-${Date.now()}`,
        name: 'Homeyhuts Direct',
        status: 'active',
        commissionPct: 0,
        lastSync: 'Real-time',
        syncType: '2-way Instant API',
      });
    }

    onboardProperty({
      name: propertyName.trim(),
      type: propertyType,
      category: propertyType === 'single_property' ? 'Airbnb / Vacation Home' : 'Hotel / Resort',
      city: city.trim() || 'Bengaluru',
      state: state.trim() || 'Karnataka',
      pincode: pincode.trim() || '560001',
      address: address.trim() || 'Prime Location',
      gstin: gstin.trim() || '29AAACH0000K1ZX',
      hsnSacCode: '996311',
      contactPhone: contactPhone.trim() || '+91 90000 00000',
      contactEmail: contactEmail.trim() || 'host@property.com',
      totalUnits,
      roomTypes: roomTypesConfig,
      channels,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">
              Onboard Client Property (Hotel or Airbnb)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Set up single property for Airbnbs or bulk room inventory for hotels.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Property Type Selection: Airbnb Single vs Hotel Bulk */}
          <div>
            <label className="font-bold text-slate-900 block mb-2 text-[11px] uppercase tracking-wider">
              1. Select Client Property Architecture *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Single Property (Airbnb) */}
              <button
                type="button"
                onClick={() => setPropertyType('single_property')}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  propertyType === 'single_property'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Single Property</div>
                  <div className="text-indigo-600 font-semibold text-[11px]">Airbnb / Vacation Villa</div>
                  <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                    1 unified inventory unit. Full property rental. Syncs 1 calendar across Airbnb, Goibibo, and Direct engine.
                  </p>
                </div>
              </button>

              {/* Option B: Bulk Property (Hotel) */}
              <button
                type="button"
                onClick={() => setPropertyType('bulk_property')}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  propertyType === 'bulk_property'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Bulk Property</div>
                  <div className="text-indigo-600 font-semibold text-[11px]">Hotels &amp; Resorts</div>
                  <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                    Multi-room bulk inventory. Categorized room types (Deluxe, Suites) with distinct unit counts &amp; room numbers.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section: Basic Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
              2. General Property &amp; Legal Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="font-medium text-slate-700">Property / Commercial Name *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    propertyType === 'single_property'
                      ? 'e.g. Whispering Pines Villa'
                      : 'e.g. Grand Horizon Palace Hotel'
                  }
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">City / Destination *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa, Bengaluru, Ooty"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">State *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karnataka, Goa, Kerala"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Property GSTIN (for GST reports) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 29AAACH7429K1ZX"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Inventory Configuration (Dynamic per type) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
              3. Inventory &amp; Room Configuration
            </span>

            {propertyType === 'single_property' ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="font-bold text-slate-800 text-xs">
                  Single Airbnb Unit Configuration (1 Inventory Key)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-medium text-slate-700">Listing Title / Structure</label>
                    <input
                      type="text"
                      value={singleUnitTitle}
                      onChange={(e) => setSingleUnitTitle(e.target.value)}
                      className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700">Max Guest Capacity</label>
                    <input
                      type="number"
                      value={singleMaxGuests}
                      onChange={(e) => setSingleMaxGuests(parseInt(e.target.value, 10) || 1)}
                      className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700">Base Nightly Rate (₹)</label>
                    <input
                      type="number"
                      value={singleBaseRate}
                      onChange={(e) => setSingleBaseRate(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {bulkRoomTypes.map((r, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{r.name}</span>
                        <span className="text-slate-500 ml-2">
                          ({r.units} rooms · ₹{r.baseRate}/night)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBulkRoom(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new room category */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <input
                    type="text"
                    placeholder="Category (e.g. Presidential Suite)"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="flex-1 min-w-[140px] bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Units count"
                    value={newRoomUnits}
                    onChange={(e) => setNewRoomUnits(e.target.value)}
                    className="w-24 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Rate ₹"
                    value={newRoomRate}
                    onChange={(e) => setNewRoomRate(e.target.value)}
                    className="w-24 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddBulkRoom}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium"
                  >
                    + Add Category
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section: Connected OTA Channels */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
              4. Instant 2-Way Connected OTA Channels
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableGoibibo}
                  onChange={(e) => setEnableGoibibo(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-800">Goibibo / MMT</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAirbnb}
                  onChange={(e) => setEnableAirbnb(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-800">Airbnb</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBookingCom}
                  onChange={(e) => setEnableBookingCom(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-800">Booking.com</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDirect}
                  onChange={(e) => setEnableDirect(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-800">Homeyhuts Direct</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
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
              Complete Client Onboarding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
