import React from 'react';
import { Booking, Property } from '../types';
import { useChannelManager } from '../context/ChannelManagerContext';
import { X, Printer, Download, CheckCircle, Building2 } from 'lucide-react';

interface InvoiceModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ booking, onClose }) => {
  const { properties } = useChannelManager();

  if (!booking) return null;

  const property =
    properties.find((p) => p.id === booking.propertyId) || properties[0];

  const handlePrint = () => {
    window.print();
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val);
  };

  // Convert number to words helper
  const numToWords = (num: number) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10];
      if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + inWords(n % 100);
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
      return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
    };

    const integerPart = Math.floor(num);
    return `Rupees ${inWords(integerPart).trim()} Only`;
  };

  const isInterstate = booking.igst > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Action Header */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Tax Invoice: {booking.invoiceNumber}</span>
            <span className="text-xs text-slate-400">· Booking #{booking.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Document */}
        <div className="flex-1 overflow-y-auto p-8 text-slate-900 text-xs bg-white" id="printable-document">
          {/* Header & Brand */}
          <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold">
                  SS
                </div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {property.name}
                </h1>
              </div>
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
              <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                GST Tax Invoice
              </span>
              <div className="mt-3 font-mono text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Invoice No:</span>{' '}
                  <span className="font-bold text-slate-900">{booking.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">Date:</span>{' '}
                  <span className="text-slate-900">{booking.createdAt}</span>
                </div>
                <div>
                  <span className="text-slate-500">Booking Ref:</span>{' '}
                  <span className="text-slate-900">{booking.id}</span>
                </div>
                <div>
                  <span className="text-slate-500">Place of Supply:</span>{' '}
                  <span className="font-semibold text-slate-900">{property.state}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest & Billing Details */}
          <div className="grid grid-cols-2 gap-6 py-5 border-b border-slate-200">
            <div>
              <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-2">
                Billed To (Guest Details)
              </h2>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">{booking.guestName}</p>
                <p className="text-slate-600">Phone: {booking.guestPhone}</p>
                <p className="text-slate-600">Email: {booking.guestEmail}</p>
                <p className="text-slate-600">State: {booking.guestState}</p>
                {booking.guestGSTIN && (
                  <p className="font-mono text-indigo-700 font-bold mt-1">
                    Guest GSTIN: {booking.guestGSTIN} (B2B Input Tax Credit Eligible)
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-2">
                Stay &amp; Channel Details
              </h2>
              <div className="space-y-1 font-mono text-slate-700">
                <p>
                  <span className="text-slate-500">Category:</span> {booking.roomTypeName}
                </p>
                {booking.roomNumber && (
                  <p>
                    <span className="text-slate-500">Allocated Unit:</span> Room {booking.roomNumber}
                  </p>
                )}
                <p>
                  <span className="text-slate-500">Check-in:</span> {booking.checkIn} (14:00)
                </p>
                <p>
                  <span className="text-slate-500">Check-out:</span> {booking.checkOut} (11:00)
                </p>
                <p>
                  <span className="text-slate-500">Duration:</span> {booking.nights} Night(s) · {booking.adults} Adult(s)
                </p>
                <p>
                  <span className="text-slate-500">Channel Origin:</span> {booking.source}
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <th className="py-2">Item / Service Description</th>
                  <th className="py-2 text-center">HSN/SAC</th>
                  <th className="py-2 text-center">Qty / Nights</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Taxable Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {/* Stay Charges */}
                <tr>
                  <td className="py-3 font-sans">
                    <div className="font-bold text-slate-900">Room Accommodation Services</div>
                    <div className="text-[11px] text-slate-500">
                      {booking.roomTypeName} · {booking.nights} Night(s) Stay
                    </div>
                  </td>
                  <td className="py-3 text-center text-slate-600">996311</td>
                  <td className="py-3 text-center text-slate-700">{booking.nights}</td>
                  <td className="py-3 text-right text-slate-700">
                    {formatINR(booking.baseRatePerNight)}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    {formatINR(booking.stayAmount)}
                  </td>
                </tr>

                {/* Upsells */}
                {booking.upsellItems?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 font-sans">
                      <div className="font-medium text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-400">Hospitality Ancillary Service</div>
                    </td>
                    <td className="py-2.5 text-center text-slate-600">996331</td>
                    <td className="py-2.5 text-center text-slate-700">1</td>
                    <td className="py-2.5 text-right text-slate-700">{formatINR(item.amount)}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{formatINR(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation & Taxes Breakdown */}
          <div className="border-t border-slate-200 pt-4 flex justify-end">
            <div className="w-72 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Value:</span>
                <span>{formatINR(booking.stayAmount + booking.upsellAmount)}</span>
              </div>

              {isInterstate ? (
                <div className="flex justify-between text-slate-600">
                  <span>Output IGST ({booking.gstRatePct}%):</span>
                  <span>{formatINR(booking.igst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Output CGST ({booking.gstRatePct / 2}%):</span>
                    <span>{formatINR(booking.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Output SGST ({booking.gstRatePct / 2}%):</span>
                    <span>{formatINR(booking.sgst)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between py-2 border-t border-b border-slate-300 font-bold text-slate-900 text-sm">
                <span>Total Invoice Value:</span>
                <span className="text-indigo-600">{formatINR(booking.totalAmount)}</span>
              </div>

              <div className="flex justify-between text-slate-700 text-[11px]">
                <span>Payment Mode:</span>
                <span className="font-bold">{booking.paymentMode}</span>
              </div>

              <div className="flex justify-between text-slate-700 text-[11px]">
                <span>Advance / Received:</span>
                <span className="text-emerald-700 font-bold">{formatINR(booking.advancePaid)}</span>
              </div>

              {booking.balanceDue > 0 && (
                <div className="flex justify-between text-rose-700 font-bold text-[11px]">
                  <span>Balance Due:</span>
                  <span>{formatINR(booking.balanceDue)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount in words */}
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 font-semibold">Amount in Words: </span>
            <span className="font-bold text-slate-900">{numToWords(booking.totalAmount)}</span>
          </div>

          {/* Footer Terms & Signatures */}
          <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-200">
            <div>
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                Terms &amp; Conditions
              </p>
              <ul className="list-disc list-inside text-[10px] text-slate-500 mt-1 space-y-0.5">
                <li>Government photo ID is mandatory at physical check-in.</li>
                <li>Standard check-in 14:00 hrs; check-out 11:00 hrs.</li>
                <li>Tariff is subject to applicable Indian GST regulations.</li>
              </ul>
            </div>

            <div className="text-right flex flex-col justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-slate-800">For {property.name}</p>
                <div className="h-10" />
                <p className="text-[10px] text-slate-500 font-medium border-t border-slate-300 pt-1">
                  Authorised Signatory / Frontdesk Manager
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
