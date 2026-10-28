import React from 'react';
import { Quotation } from '../types';
import { useChannelManager } from '../context/ChannelManagerContext';
import { X, Printer, ArrowRight, CheckCircle2 } from 'lucide-react';

interface QuotationModalProps {
  quotation: Quotation | null;
  onClose: () => void;
  onConverted: () => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  quotation,
  onClose,
  onConverted,
}) => {
  const { properties, convertQuotationToBooking } = useChannelManager();

  if (!quotation) return null;

  const property =
    properties.find((p) => p.id === quotation.propertyId) || properties[0];

  const handlePrint = () => {
    window.print();
  };

  const handleConvert = () => {
    convertQuotationToBooking(quotation.id, 'UPI');
    onConverted();
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isConverted = quotation.status === 'converted';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Quotation #{quotation.id}</span>
            <span className="text-xs text-slate-400">· {quotation.guestName}</span>
          </div>

          <div className="flex items-center gap-2">
            {!isConverted && (
              <button
                onClick={handleConvert}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Convert to Booking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Quote</span>
            </button>

            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="flex-1 overflow-y-auto p-8 text-slate-900 text-xs bg-white" id="printable-document">
          <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {property.name}
              </h1>
              <p className="text-slate-600 mt-1">{property.address}</p>
              <p className="text-slate-600">
                {property.city}, {property.state} – {property.pincode}
              </p>
              <div className="mt-2 font-mono text-[11px] text-slate-800 space-x-3">
                <span><strong>GSTIN:</strong> {property.gstin}</span>
                <span><strong>Phone:</strong> {property.contactPhone}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded">
                Pro-Forma Quotation
              </span>
              <div className="mt-3 font-mono text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Quote ID:</span>{' '}
                  <span className="font-bold text-slate-900">{quotation.id}</span>
                </div>
                <div>
                  <span className="text-slate-500">Date:</span>{' '}
                  <span className="text-slate-900">{quotation.createdAt}</span>
                </div>
                <div>
                  <span className="text-slate-500">Valid Until:</span>{' '}
                  <span className="font-bold text-amber-700">{quotation.validUntil}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 py-5 border-b border-slate-200">
            <div>
              <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-2">
                Quotation Prepared For
              </h2>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">{quotation.guestName}</p>
                {quotation.companyName && (
                  <p className="font-semibold text-slate-700">{quotation.companyName}</p>
                )}
                <p className="text-slate-600">Phone: {quotation.phone}</p>
                <p className="text-slate-600">Email: {quotation.email}</p>
              </div>
            </div>

            <div>
              <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-2">
                Proposed Itinerary
              </h2>
              <div className="space-y-1 font-mono text-slate-700">
                <p>
                  <span className="text-slate-500">Room Category:</span> {quotation.roomTypeName}
                </p>
                <p>
                  <span className="text-slate-500">Quantity:</span> {quotation.roomCount} Unit(s)
                </p>
                <p>
                  <span className="text-slate-500">Check-in:</span> {quotation.checkIn}
                </p>
                <p>
                  <span className="text-slate-500">Check-out:</span> {quotation.checkOut}
                </p>
                <p>
                  <span className="text-slate-500">Duration:</span> {quotation.nights} Nights
                </p>
              </div>
            </div>
          </div>

          <div className="py-5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Room Count</th>
                  <th className="py-2 text-center">Nights</th>
                  <th className="py-2 text-right">Nightly Rate</th>
                  <th className="py-2 text-right">Taxable Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-3 font-sans">
                    <div className="font-bold text-slate-900">{quotation.roomTypeName} Accommodation</div>
                    <div className="text-[11px] text-slate-500">SAC Code: 996311</div>
                  </td>
                  <td className="py-3 text-center text-slate-700">{quotation.roomCount}</td>
                  <td className="py-3 text-center text-slate-700">{quotation.nights}</td>
                  <td className="py-3 text-right text-slate-700">{formatINR(quotation.ratePerNight)}</td>
                  <td className="py-3 text-right font-bold text-slate-900">{formatINR(quotation.subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end">
            <div className="w-72 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount:</span>
                <span>{formatINR(quotation.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated GST ({quotation.gstRatePct}%):</span>
                <span>{formatINR(quotation.gstAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-b border-slate-300 font-bold text-slate-900 text-sm">
                <span>Total Estimated Value:</span>
                <span className="text-indigo-600">{formatINR(quotation.totalEstimate)}</span>
              </div>
            </div>
          </div>

          {quotation.notes && (
            <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800">Inclusions &amp; Notes:</span>
              <p className="text-slate-600 mt-1">{quotation.notes}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
            <p><strong>Terms:</strong> This quotation is valid until {quotation.validUntil}. Inventory is subject to availability and will only be locked across OTAs upon advance confirmation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
