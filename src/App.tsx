import React, { useState } from 'react';
import { ChannelManagerProvider, useChannelManager } from './context/ChannelManagerContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CalendarSyncMatrix } from './components/CalendarSyncMatrix';
import { BookingsManager } from './components/BookingsManager';
import { InvoicesQuotesView } from './components/InvoicesQuotesView';
import { GSTReports } from './components/GSTReports';
import { PropertyManager } from './components/PropertyManager';
import { CreateBookingModal } from './components/CreateBookingModal';
import { InvoiceModal } from './components/InvoiceModal';
import { CreateQuotationModal } from './components/CreateQuotationModal';
import { QuotationModal } from './components/QuotationModal';
import { OnboardPropertyModal } from './components/OnboardPropertyModal';
import { Booking, Quotation } from './types';
import { RefreshCw, RotateCcw } from 'lucide-react';

function ChannelManagerApp() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'calendar' | 'bookings' | 'invoices' | 'gst' | 'properties'>('dashboard');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isCreateQuoteModalOpen, setIsCreateQuoteModalOpen] = useState(false);

  const [activeInvoiceBooking, setActiveInvoiceBooking] = useState<Booking | null>(null);
  const [activeQuotationView, setActiveQuotationView] = useState<Quotation | null>(null);

  const { resetToDefaultData } = useChannelManager();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 3-Zone Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewBookingModal={() => setIsBookingModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            onOpenNewBookingModal={() => setIsBookingModalOpen(true)}
            onNavigateToCalendar={() => setCurrentTab('calendar')}
            onNavigateToInvoices={() => setCurrentTab('invoices')}
          />
        )}

        {currentTab === 'calendar' && <CalendarSyncMatrix />}

        {currentTab === 'bookings' && (
          <BookingsManager
            onOpenNewBookingModal={() => setIsBookingModalOpen(true)}
            onOpenInvoice={(booking) => setActiveInvoiceBooking(booking)}
          />
        )}

        {currentTab === 'invoices' && (
          <InvoicesQuotesView
            onOpenInvoice={(booking) => setActiveInvoiceBooking(booking)}
            onOpenCreateQuotation={() => setIsCreateQuoteModalOpen(true)}
            onViewQuotation={(quotation) => setActiveQuotationView(quotation)}
          />
        )}

        {currentTab === 'gst' && <GSTReports />}

        {currentTab === 'properties' && (
          <PropertyManager
            onOpenOnboardModal={() => setIsOnboardModalOpen(true)}
            onSelectPropertyToManage={() => setCurrentTab('dashboard')}
          />
        )}
      </main>

      {/* Modals */}
      <CreateBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccessOpenInvoice={(newBooking) => setActiveInvoiceBooking(newBooking)}
      />

      <InvoiceModal
        booking={activeInvoiceBooking}
        onClose={() => setActiveInvoiceBooking(null)}
      />

      <CreateQuotationModal
        isOpen={isCreateQuoteModalOpen}
        onClose={() => setIsCreateQuoteModalOpen(false)}
        onSuccessOpenQuote={(newQuote) => setActiveQuotationView(newQuote)}
      />

      <QuotationModal
        quotation={activeQuotationView}
        onClose={() => setActiveQuotationView(null)}
        onConverted={() => {
          setActiveQuotationView(null);
          setCurrentTab('bookings');
        }}
      />

      <OnboardPropertyModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
      />

      {/* Clean Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-800">SyncStay Channel Manager</span>
            <span className="mx-2">·</span>
            <span>2-Way OTA Synchronization Engine &amp; Frontdesk PMS</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('Reset all demo data back to prompt baseline metrics?')) {
                  resetToDefaultData();
                }
              }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
              title="Reset to default prompt figures (₹32,087.48 revenue, 25.0% occupancy)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
            <span className="font-mono text-[11px] text-slate-400">v2.4.0 (Live Ready)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ChannelManagerProvider>
      <ChannelManagerApp />
    </ChannelManagerProvider>
  );
}
