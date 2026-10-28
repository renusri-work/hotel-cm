import React, { useState } from 'react';
import { useChannelManager } from '../context/ChannelManagerContext';
import { Download, Printer, Calendar, FileText, CheckCircle2, TrendingUp } from 'lucide-react';

export const GSTReports: React.FC = () => {
  const { bookings, properties, activePropertyId } = useChannelManager();

  const [periodType, setPeriodType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [selectedYear, setSelectedYear] = useState<string>('2026-27');

  // Filter bookings based on property and date
  const filteredBookings = bookings.filter((b) => {
    if (activePropertyId !== 'all' && b.propertyId !== activePropertyId) {
      return false;
    }

    if (periodType === 'monthly') {
      return b.createdAt.startsWith(selectedMonth);
    } else {
      // FY 2026-27 (Apr 2026 to Mar 2027)
      return b.createdAt.startsWith('2026');
    }
  });

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val);
  };

  // Computations
  const totalGrossRevenue = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalTaxable = filteredBookings.reduce((sum, b) => sum + (b.stayAmount + (b.upsellAmount || 0)), 0);
  const totalCGST = filteredBookings.reduce((sum, b) => sum + b.cgst, 0);
  const totalSGST = filteredBookings.reduce((sum, b) => sum + b.sgst, 0);
  const totalIGST = filteredBookings.reduce((sum, b) => sum + b.igst, 0);
  const totalTaxLiability = totalCGST + totalSGST + totalIGST;

  // B2B vs B2C breakdown
  const b2bBookings = filteredBookings.filter((b) => !!b.guestGSTIN);
  const b2cBookings = filteredBookings.filter((b) => !b.guestGSTIN);

  const b2bTaxable = b2bBookings.reduce((sum, b) => sum + (b.stayAmount + (b.upsellAmount || 0)), 0);
  const b2bTax = b2bBookings.reduce((sum, b) => sum + b.cgst + b.sgst + b.igst, 0);

  const b2cTaxable = b2cBookings.reduce((sum, b) => sum + (b.stayAmount + (b.upsellAmount || 0)), 0);
  const b2cTax = b2cBookings.reduce((sum, b) => sum + b.cgst + b.sgst + b.igst, 0);

  // CSV Export Generator
  const handleExportCSV = () => {
    const headers = [
      'Invoice No',
      'Invoice Date',
      'Booking ID',
      'Guest Name',
      'Guest State',
      'Guest GSTIN (B2B)',
      'Supply Type',
      'SAC Code',
      'Taxable Amount',
      'GST Rate %',
      'CGST',
      'SGST',
      'IGST',
      'Total Invoice Value',
    ];

    const rows = filteredBookings.map((b) => [
      b.invoiceNumber,
      b.createdAt,
      b.id,
      `"${b.guestName.replace(/"/g, '""')}"`,
      b.guestState,
      b.guestGSTIN || 'N/A (B2C)',
      b.igst > 0 ? 'Inter-State' : 'Intra-State',
      '996311',
      (b.stayAmount + (b.upsellAmount || 0)).toFixed(2),
      b.gstRatePct,
      b.cgst.toFixed(2),
      b.sgst.toFixed(2),
      b.igst.toFixed(2),
      b.totalAmount.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `GST_Report_${periodType === 'monthly' ? selectedMonth : selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <span>Statutory Compliance &amp; Tax Audits</span>
            <span>·</span>
            <span className="text-slate-500">GSTR-1 &amp; GSTR-3B Hospitality</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            GST Returns &amp; Tax Reports
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Period Selection Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Monthly vs Yearly Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                periodType === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Return
            </button>
            <button
              onClick={() => setPeriodType('yearly')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                periodType === 'yearly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly Annual Return
            </button>
          </div>

          {/* Month / Year Pickers */}
          {periodType === 'monthly' ? (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="2026-10">October 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
            </select>
          ) : (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="2026-27">FY 2026-27 (Current Fiscal)</option>
              <option value="2025-26">FY 2025-26 (Audited)</option>
            </select>
          )}
        </div>

        <div className="text-xs text-slate-500 font-mono">
          <span>SAC 996311 (Accommodation) · SAC 996331 (F&amp;B Services)</span>
        </div>
      </div>

      {/* KPI Cards: Taxable Value & Tax Slabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Taxable Turnover</div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatINR(totalTaxable)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across {filteredBookings.length} booking supplies
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total GST Collected</div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-600 tabular-nums">
            {formatINR(totalTaxLiability)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Output tax for filing GSTR-3B
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">CGST + SGST (Intra-state)</div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
            {formatINR(totalCGST + totalSGST)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            CGST: {formatINR(totalCGST)} · SGST: {formatINR(totalSGST)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">IGST (Inter-state)</div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
            {formatINR(totalIGST)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Guest located outside property home state
          </div>
        </div>
      </div>

      {/* B2B vs B2C Breakdown Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* B2B Supplies */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                GSTR-1 Table 4: B2B Supplies (With Guest GSTIN)
              </h2>
              <p className="text-xs text-slate-500">Eligible for Guest Input Tax Credit</p>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-600">
              {b2bBookings.length} Invoices
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-sans block text-[11px]">B2B Taxable</span>
              <span className="text-slate-900 font-bold">{formatINR(b2bTaxable)}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-sans block text-[11px]">B2B Total Tax</span>
              <span className="text-slate-900 font-bold">{formatINR(b2bTax)}</span>
            </div>
          </div>
        </div>

        {/* B2C Supplies */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                GSTR-1 Table 7: B2C Supplies (Consumer Retail)
              </h2>
              <p className="text-xs text-slate-500">Regular walk-in &amp; OTA guests without GSTIN</p>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-600">
              {b2cBookings.length} Invoices
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-sans block text-[11px]">B2C Taxable</span>
              <span className="text-slate-900 font-bold">{formatINR(b2cTaxable)}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-sans block text-[11px]">B2C Total Tax</span>
              <span className="text-slate-900 font-bold">{formatINR(b2cTax)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Invoice-Level GST Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" id="printable-document">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Detailed Tax Invoices Ledger ({periodType === 'monthly' ? selectedMonth : selectedYear})
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Total Supplies: {filteredBookings.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Guest &amp; GSTIN</th>
                <th className="py-3 px-2 text-center">SAC</th>
                <th className="py-3 px-3 text-right">Taxable (₹)</th>
                <th className="py-3 px-2 text-center">Rate</th>
                <th className="py-3 px-3 text-right">CGST (₹)</th>
                <th className="py-3 px-3 text-right">SGST (₹)</th>
                <th className="py-3 px-3 text-right">IGST (₹)</th>
                <th className="py-3 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredBookings.map((b) => {
                const taxable = b.stayAmount + (b.upsellAmount || 0);
                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{b.invoiceNumber}</td>
                    <td className="py-3 px-3 text-slate-600 font-sans">{b.createdAt}</td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-900">{b.guestName}</div>
                      {b.guestGSTIN ? (
                        <div className="text-[10px] text-indigo-700 font-mono">
                          {b.guestGSTIN} (B2B)
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400">B2C Retail</div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center text-slate-600">996311</td>
                    <td className="py-3 px-3 text-right text-slate-900">{taxable.toFixed(2)}</td>
                    <td className="py-3 px-2 text-center text-slate-600">{b.gstRatePct}%</td>
                    <td className="py-3 px-3 text-right text-slate-600">{b.cgst.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-slate-600">{b.sgst.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-slate-600">{b.igst.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{b.totalAmount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-mono font-bold text-slate-900 border-t-2 border-slate-300">
                <td colSpan={4} className="py-3 px-3 font-sans text-right">
                  Summary Totals:
                </td>
                <td className="py-3 px-3 text-right">{totalTaxable.toFixed(2)}</td>
                <td className="py-3 px-2 text-center">—</td>
                <td className="py-3 px-3 text-right">{totalCGST.toFixed(2)}</td>
                <td className="py-3 px-3 text-right">{totalSGST.toFixed(2)}</td>
                <td className="py-3 px-3 text-right">{totalIGST.toFixed(2)}</td>
                <td className="py-3 px-3 text-right text-indigo-600">{totalGrossRevenue.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
