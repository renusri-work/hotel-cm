import React from 'react';
import { useChannelManager } from '../context/ChannelManagerContext';
import { Building2, Calendar, FileText, BarChart3, Plus, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'calendar' | 'bookings' | 'invoices' | 'gst' | 'properties';
  setCurrentTab: (tab: 'dashboard' | 'calendar' | 'bookings' | 'invoices' | 'gst' | 'properties') => void;
  onOpenNewBookingModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenNewBookingModal }) => {
  const { properties, activePropertyId, setActivePropertyId, isSyncing, triggerManualSync } = useChannelManager();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text element Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-inner group-hover:bg-indigo-500 transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                  SyncStay
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400">
                  Channel Manager
                </span>
              </div>
            </button>

            {/* Contextual Property Switcher */}
            <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-800">
              <label htmlFor="property-switcher" className="sr-only">Switch Property</label>
              <select
                id="property-switcher"
                value={activePropertyId}
                onChange={(e) => setActivePropertyId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Properties ({properties.length})</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type === 'single_property' ? 'Airbnb Single' : 'Hotel Bulk'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-line, 1-2 words, unboxed) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setCurrentTab('calendar')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'calendar'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Calendar & Sync
            </button>

            <button
              onClick={() => setCurrentTab('bookings')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'bookings'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Bookings
            </button>

            <button
              onClick={() => setCurrentTab('invoices')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'invoices'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Invoices & Quotes
            </button>

            <button
              onClick={() => setCurrentTab('gst')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'gst'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              GST Reports
            </button>

            <button
              onClick={() => setCurrentTab('properties')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'properties'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Properties
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={triggerManualSync}
              disabled={isSyncing}
              title="Sync All Connected Channels"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            <button
              onClick={onOpenNewBookingModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <Plus className="w-4 h-4" />
              <span>Offline Booking</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-800 gap-2 text-xs scrollbar-none">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'dashboard' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('calendar')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'calendar' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
          >
            Calendar
          </button>
          <button
            onClick={() => setCurrentTab('bookings')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'bookings' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
          >
            Bookings
          </button>
          <button
            onClick={() => setCurrentTab('invoices')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'invoices' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
          >
            Invoices
          </button>
          <button
            onClick={() => setCurrentTab('gst')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'gst' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
          >
            GST
          </button>
          <button
            onClick={() => setCurrentTab('properties')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'properties' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
          >
            Properties
          </button>
        </div>
      </div>
    </header>
  );
};
