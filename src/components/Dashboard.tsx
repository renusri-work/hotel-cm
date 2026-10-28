import React, { useState } from 'react';
import { useChannelManager } from '../context/ChannelManagerContext';
import { ArrowUpRight, CheckCircle2, TrendingUp, Calendar, Zap, AlertCircle } from 'lucide-react';

interface DashboardProps {
  onOpenNewBookingModal: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToInvoices: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenNewBookingModal,
  onNavigateToCalendar,
  onNavigateToInvoices,
}) => {
  const {
    getPerformanceStats,
    activePropertyId,
    properties,
    simulateInboundBooking,
    isSyncing,
    syncLogs,
  } = useChannelManager();

  const [activeShareTab, setActiveShareTab] = useState<'revenue' | 'bookings'>('revenue');

  const stats = getPerformanceStats(activePropertyId);
  const activeProperty = properties.find((p) => p.id === activePropertyId);

  // Format currency in Indian Rupees
  const formatINR = (val: number, decimals = 2) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Context Line */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <span>PMS &amp; Channel Manager</span>
            <span>·</span>
            <span className="text-slate-500">
              {activeProperty ? `${activeProperty.name} (${activeProperty.type === 'single_property' ? 'Single Unit Airbnb' : 'Hotel Bulk'})` : 'Consolidated Portfolio'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Performance Overview
          </h1>
        </div>

        {/* Sync Status / Quick Inbound Simulation */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">2-Way Sync Active</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">Goibibo, Airbnb, MMT, Direct</span>
          </div>

          <button
            onClick={() => simulateInboundBooking('Goibibo')}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
            title="Simulate an online OTA booking arriving"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Simulate Goibibo Booking</span>
          </button>
        </div>
      </div>

      {/* Primary Performance Section (Exact breakdown requested) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-bold text-slate-900">Performance</h2>
            <span className="text-sm font-medium text-slate-500">
              {stats.periodLabel}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {stats.comparisonLabel}
          </span>
        </div>

        {/* 4 Core Financial & Operational KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Net Revenue Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Net revenue</span>
                <span className="text-indigo-600 font-semibold">RevenueNew</span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {formatINR(stats.netRevenue, 2)}
              </div>

              {/* Sub-breakdown: Stay, Upsell, Expenses, Net Operating Income */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Stay</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatINR(stats.stayRevenue, 2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Upsell</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatINR(stats.upsellRevenue, 2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>− Expenses</span>
                  <span className="font-mono tabular-nums">
                    {formatINR(stats.expenses, 2)} · {stats.expensesPctOfRevenue}% of revenue
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-medium text-slate-900">
                  <span>= Net operating income</span>
                  <span className="font-mono tabular-nums font-bold text-indigo-600">
                    {formatINR(stats.netOperatingIncome, 2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Margin</span>
                  <span className="font-mono">{stats.netMarginPct.toFixed(1)}% margin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Occupancy */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Occupancy</span>
                <span className="text-slate-400">by check-in date</span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {stats.occupancyPct.toFixed(1)}%
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {stats.bookedNights} of {stats.availableNights} nights
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>↑ {stats.occupancyDiffPts.toFixed(1)} pts</span>
              <span className="text-slate-400 font-normal">vs prior period</span>
            </div>
          </div>

          {/* Card 3: Net ADR */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Net ADR</span>
                <span className="text-indigo-600 font-semibold text-[11px]">New</span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {formatINR(stats.netADR, 0)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                per booked night
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Avg Room Realization</span>
              <span className="font-mono text-slate-700 font-medium">100% On-target</span>
            </div>
          </div>

          {/* Card 4: Net RevPAR */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Net RevPAR</span>
                <span className="text-indigo-600 font-semibold text-[11px]">New</span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {formatINR(stats.netRevPAR, 0)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                per available night
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Total Inventory Yield</span>
              <span className="font-mono text-slate-700 font-medium">₹1,146 / unit / day</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: Where Bookings Come From & Today's Operational Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Where bookings come from */}
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Where bookings come from</h3>
              <p className="text-xs text-slate-500 mt-0.5">{stats.periodLabel}</p>
            </div>

            {/* Segmented Tab: Revenue vs Bookings */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
              <button
                onClick={() => setActiveShareTab('revenue')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeShareTab === 'revenue'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveShareTab('bookings')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeShareTab === 'bookings'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bookings
              </button>
            </div>
          </div>

          {/* Revenue summary and proportional progress bar */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {formatINR(stats.netRevenue, 0)}
                </span>
                <span className="text-xs text-slate-500 ml-1.5">
                  {activeShareTab === 'revenue' ? 'revenue' : 'total bookings'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 inline-block" />
                  Goibibo 75%
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-800 inline-block" />
                  Homeyhuts Direct 25%
                </span>
              </div>
            </div>

            {/* Proportional visual bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
              <div style={{ width: '75%' }} className="bg-indigo-600 h-full" title="Goibibo (75%)" />
              <div style={{ width: '25%' }} className="bg-slate-800 h-full" title="Homeyhuts Direct (25%)" />
            </div>
          </div>

          {/* Detailed Source Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 pr-4">Source</th>
                  <th className="py-2.5 px-3 text-right">Bookings</th>
                  <th className="py-2.5 px-3 text-right">Nights</th>
                  <th className="py-2.5 px-3 text-right">Share</th>
                  <th className="py-2.5 px-3 text-right">Net ADR</th>
                  <th className="py-2.5 pl-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {stats.channelBreakdown.map((row) => (
                  <tr key={row.source} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pr-4 font-sans font-medium text-slate-900">
                      <div>
                        <span>{row.source}</span>
                        {row.commissionSaved && (
                          <div className="text-[11px] font-sans text-emerald-600 font-medium mt-0.5">
                            ≈ {formatINR(row.commissionSaved, 0)} saved in commission
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-700">{row.bookingsCount}</td>
                    <td className="py-3.5 px-3 text-right text-slate-700">{row.nightsCount}</td>
                    <td className="py-3.5 px-3 text-right font-medium text-slate-900">{row.sharePct}%</td>
                    <td className="py-3.5 px-3 text-right text-slate-700">{formatINR(row.netADR, 0)}</td>
                    <td className="py-3.5 pl-3 text-right font-bold text-slate-900">{formatINR(row.revenue, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Today's Frontdesk Operations Card (Exact figures) */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today</h3>
                <p className="text-xs text-slate-500 mt-0.5">{stats.today.dateLabel}</p>
              </div>
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>

            {/* 4 Metrics in Today's Card */}
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {stats.today.checkIns}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  Check-ins
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {stats.today.checkOuts}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  Check-outs
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {stats.today.ongoingStays}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  Ongoing stays
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {stats.today.arrivingNext2Days}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  Arriving in next 2 days
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={onOpenNewBookingModal}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>+ Log Offline Walk-in</span>
            </button>
            <button
              onClick={onNavigateToCalendar}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <span>Open Calendar &amp; Matrix</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </div>

      {/* Channel Sync Heartbeat & Recent Synchronizations */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Live Channel Sync Activity (2-Way Heartbeat)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Offline walk-ins instantly block online OTAs; online reservations lock offline frontdesk.
          </span>
        </div>

        <div className="mt-3 divide-y divide-slate-100 text-xs">
          {syncLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">{log.channel}</span>
                  <p className="text-slate-600 mt-0.5">{log.description}</p>
                </div>
              </div>
              <span className="text-slate-400 font-mono text-[11px] shrink-0 whitespace-nowrap">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
