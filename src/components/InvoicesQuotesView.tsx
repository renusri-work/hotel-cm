import React, { useState } from 'react';
import { useChannelManager } from '../context/ChannelManagerContext';
import { Booking, Quotation } from '../types';
import { Plus, Printer, FileText, CheckCircle2, ArrowRight, Clock, Building2 } from 'lucide-react';

interface InvoicesQuotesViewProps {
  onOpenInvoice: (booking: Booking) => void;
  onOpenCreateQuotation: () => void;
  onViewQuotation: (quotation: Quotation) => void;
}

export const InvoicesQuotesView: React.FC<InvoicesQuotesViewProps> = ({
  onOpenInvoice,
  onOpenCreateQuotation,
  onViewQuotation,
}) => {
  const { bookings, quotations, convertQuotationToBooking, activePropertyId } = useChannelManager();
  const [activeTab, setActiveTab] = useState<'invoices' | 'quotations'>('invoices');

  const filteredBookings = bookings.filter((b) =>
    activePropertyId === 'all' ? true : b.propertyId === activePropertyId
  );

  const filteredQuotations = quotations.filter((q) =>
    activePropertyId === 'all' ? true : q.propertyId === activePropertyId
  );

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleConvertQuote = (quote: Quotation) => {
    const booking = convertQuotationToBooking(quote.id, 'UPI');
    if (booking) {
      onOpenInvoice(booking);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <span>Billing &amp; Commercial Documents</span>
            <span>·</span>
            <span className="text-slate-500">Tax Invoices &amp; Quotations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Invoices &amp; Quotations
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'quotations' && (
            <button
              onClick={onOpenCreateQuotation}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Quotation / Estimate</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Switcher: Invoices vs Quotations */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'invoices'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>GST Tax Invoices ({filteredBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'quotations'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Pro-forma Quotations ({filteredQuotations.length})</span>
        </button>
      </div>

      {/* Tab 1: GST Tax Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Billed To</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-3 text-right">Taxable (₹)</th>
                  <th className="py-3 px-3 text-right">GST (₹)</th>
                  <th className="py-3 px-3 text-right">Grand Total (₹)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredBookings.map((b) => {
                  const taxable = b.stayAmount + (b.upsellAmount || 0);
                  const gst = b.cgst + b.sgst + b.igst;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {b.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-sans">
                        {b.createdAt}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-slate-900">{b.guestName}</div>
                        {b.guestGSTIN ? (
                          <div className="text-[10px] text-indigo-700 font-mono font-medium">
                            GSTIN: {b.guestGSTIN}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">B2C Retail Guest</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-700 font-medium">
                        {b.propertyName}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-700">
                        {formatINR(taxable)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-600">
                        {formatINR(gst)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                        {formatINR(b.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          onClick={() => onOpenInvoice(b)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View &amp; Print</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Pro-forma Quotations */}
      {activeTab === 'quotations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuotations.map((q) => {
              const isConverted = q.status === 'converted';
              return (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {q.id}
                        </span>
                        <h2 className="text-base font-bold text-slate-900 mt-0.5">
                          {q.guestName}
                        </h2>
                        {q.companyName && (
                          <p className="text-xs text-slate-500">{q.companyName}</p>
                        )}
                      </div>

                      <span
                        className={`text-xs font-medium ${
                          isConverted ? 'text-emerald-700 font-semibold' : 'text-indigo-600'
                        }`}
                      >
                        {isConverted ? '✓ Converted to Booking' : 'Active Quotation'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 text-xs text-slate-600 font-mono">
                      <div>
                        <span className="text-slate-400 block font-sans text-[11px]">Property</span>
                        <span className="text-slate-800 font-sans font-medium">{q.propertyName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans text-[11px]">Room &amp; Qty</span>
                        <span>{q.roomCount}x {q.roomTypeName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans text-[11px]">Dates</span>
                        <span>{q.checkIn} → {q.checkOut} ({q.nights}N)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans text-[11px]">Valid Until</span>
                        <span className="text-amber-700">{q.validUntil}</span>
                      </div>
                    </div>

                    {q.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {q.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-sans block">Estimated Total</span>
                      <span className="font-mono text-lg font-bold text-slate-900">
                        {formatINR(q.totalEstimate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewQuotation(q)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
                      >
                        View Sheet
                      </button>

                      {!isConverted && (
                        <button
                          onClick={() => handleConvertQuote(q)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          <span>Convert to Booking</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
