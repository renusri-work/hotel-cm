import React, { useState } from 'react';
import { useChannelManager } from '../context/ChannelManagerContext';
import { RefreshCw, Zap, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const CalendarSyncMatrix: React.FC = () => {
  const {
    properties,
    activePropertyId,
    setActivePropertyId,
    bookings,
    isSyncing,
    triggerManualSync,
    simulateInboundBooking,
    syncLogs,
  } = useChannelManager();

  // Selected property for calendar
  const currentProperty =
    properties.find((p) => p.id === activePropertyId) || properties[0];

  // Generate next 14 calendar dates starting from 2026-10-28
  const baseDate = new Date('2026-10-28T00:00:00');
  const dateList = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayName, dayNum, monthName };
  });

  // Local state for stop-sells and rate adjustments
  const [stopSells, setStopSells] = useState<Record<string, boolean>>({});
  const [ratesOverride, setRatesOverride] = useState<Record<string, number>>({});
  const [activeCellInfo, setActiveCellInfo] = useState<string | null>(null);

  // Toggle stop sell on an OTA
  const handleToggleStopSell = (key: string) => {
    setStopSells((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      return updated;
    });
  };

  // Check how many bookings overlap with a given date and room
  const getBookedCountForDate = (dateStr: string, roomTypeName: string) => {
    return bookings.filter((b) => {
      if (b.propertyId !== currentProperty.id) return false;
      if (b.roomTypeName !== roomTypeName) return false;
      return dateStr >= b.checkIn && dateStr < b.checkOut;
    }).length;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <span>Live Distribution Matrix</span>
            <span>·</span>
            <span className="text-slate-500">2-Way OTA Synchronization</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Room Inventory &amp; Rate Grid
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Property Selector */}
          <select
            value={currentProperty.id}
            onChange={(e) => setActivePropertyId(e.target.value)}
            className="bg-white border border-slate-300 text-xs font-medium text-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type === 'single_property' ? 'Single Airbnb' : 'Bulk Hotel'})
              </option>
            ))}
          </select>

          <button
            onClick={() => triggerManualSync()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync All Channels Now</span>
          </button>
        </div>
      </div>

      {/* Connected Channel Status Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Connected OTA Channels for {currentProperty.name}
              </h2>
              <p className="text-xs text-slate-500">
                {currentProperty.type === 'single_property'
                  ? 'Configured as Single Property (Entire Home/Airbnb 1-Unit Sync)'
                  : 'Configured as Bulk Property (Multi-Category Hotel Inventory Sync)'}
              </p>
            </div>
          </div>

          {/* Connected Channels List */}
          <div className="flex flex-wrap items-center gap-3">
            {currentProperty.channels.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-800">{ch.name}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 font-mono text-[11px]">{ch.syncType}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Simulator Notice */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Double-Booking Guard:</span>
            <span>Offline bookings made in PMS automatically push block commands to Goibibo, Airbnb, and all channels.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => simulateInboundBooking('Goibibo', currentProperty.id)}
              disabled={isSyncing}
              className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
            >
              + Inbound Goibibo Test
            </button>
            <button
              onClick={() => simulateInboundBooking('Airbnb', currentProperty.id)}
              disabled={isSyncing}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              + Inbound Airbnb Test
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Inventory & Availability Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            14-Day Calendar Matrix ({dateList[0].monthName} {dateList[0].dayNum} – {dateList[dateList.length - 1].monthName} {dateList[dateList.length - 1].dayNum}, 2026)
          </span>
          <span className="text-xs text-slate-500">
            Click any cell to toggle OTA Stop-Sell or inspect live reservation lock
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700">
                <th className="py-3 px-4 font-semibold w-56 sticky left-0 bg-slate-100/90 backdrop-blur-xs z-10 border-r border-slate-200">
                  Room Category / Unit
                </th>
                <th className="py-3 px-3 font-semibold text-center border-r border-slate-200 w-24">
                  Default Rate
                </th>
                {dateList.map((d, index) => (
                  <th
                    key={d.dateStr}
                    className={`py-3 px-2 text-center min-w-[70px] border-r border-slate-200 ${
                      index === 1 ? 'bg-indigo-50/80 font-bold text-indigo-900' : ''
                    }`}
                  >
                    <div className="text-[11px] uppercase text-slate-500">{d.dayName}</div>
                    <div className="text-sm font-bold text-slate-900 font-mono">{d.dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentProperty.roomTypes.map((room) => {
                return (
                  <React.Fragment key={room.id}>
                    {/* Availability Row */}
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-xs">
                        <div className="font-bold text-slate-900">{room.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {room.totalUnits} {room.totalUnits === 1 ? 'unit' : 'units'} · Max {room.maxGuests} guests
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center border-r border-slate-200 font-mono font-medium text-slate-700">
                        ₹{room.baseRate.toLocaleString('en-IN')}
                      </td>

                      {dateList.map((d) => {
                        const cellKey = `${room.id}_${d.dateStr}`;
                        const booked = getBookedCountForDate(d.dateStr, room.name);
                        const isStopSold = stopSells[cellKey];
                        const available = Math.max(0, room.totalUnits - booked);

                        return (
                          <td
                            key={d.dateStr}
                            onClick={() => handleToggleStopSell(cellKey)}
                            title={`Click to toggle OTA Stop-Sell for ${d.dateStr}`}
                            className={`py-2 px-2 text-center border-r border-slate-200 cursor-pointer transition-colors ${
                              isStopSold
                                ? 'bg-amber-50 text-amber-900'
                                : available === 0
                                ? 'bg-rose-50 text-rose-800'
                                : 'hover:bg-indigo-50/40 text-slate-900'
                            }`}
                          >
                            <div className="font-mono text-sm font-bold">
                              {isStopSold ? (
                                <span className="text-[11px] font-sans font-semibold text-amber-700">
                                  STOP
                                </span>
                              ) : (
                                <span>{available}</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                              {booked > 0 ? `${booked} bkd` : 'open'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Rate Row */}
                    <tr className="bg-slate-50/40 text-[11px] text-slate-500">
                      <td className="py-1.5 px-4 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 text-slate-500 font-medium italic">
                        Live OTA Rate (₹)
                      </td>
                      <td className="py-1.5 px-3 text-center border-r border-slate-200 font-mono text-slate-400">
                        —
                      </td>
                      {dateList.map((d) => (
                        <td key={d.dateStr} className="py-1.5 px-2 text-center border-r border-slate-200 font-mono text-slate-600">
                          {room.baseRate.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-white border border-slate-300 rounded-xs inline-block" />
              <span>Available on OTAs</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-rose-100 border border-rose-300 rounded-xs inline-block" />
              <span>Booked / Locked</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-100 border border-amber-300 rounded-xs inline-block" />
              <span>Stop Sell Active (Paused on Channels)</span>
            </span>
          </div>

          <span className="text-slate-500 text-[11px]">
            Changes automatically propagate to Goibibo, Airbnb, MMT and Booking.com via Instant API.
          </span>
        </div>
      </div>

      {/* Sync Log Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Channel Sync Transmission Log
        </h3>
        <div className="divide-y divide-slate-100 text-xs">
          {syncLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">{log.channel}:</span>{' '}
                  <span className="text-slate-700">{log.description}</span>
                </div>
              </div>
              <span className="text-slate-400 font-mono text-[11px] shrink-0">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
