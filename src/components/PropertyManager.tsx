import React from 'react';
import { useChannelManager } from '../context/ChannelManagerContext';
import { Plus, Building2, Home, CheckCircle2, ShieldCheck, MapPin, Phone, Mail, FileText } from 'lucide-react';

interface PropertyManagerProps {
  onOpenOnboardModal: () => void;
  onSelectPropertyToManage: (id: string) => void;
}

export const PropertyManager: React.FC<PropertyManagerProps> = ({
  onOpenOnboardModal,
  onSelectPropertyToManage,
}) => {
  const { properties, activePropertyId, setActivePropertyId } = useChannelManager();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <span>Portfolio &amp; Client Management</span>
            <span>·</span>
            <span className="text-slate-500">Single Airbnbs &amp; Bulk Hotels</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Clients &amp; Properties
          </h1>
        </div>

        <button
          onClick={onOpenOnboardModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Onboard New Client</span>
        </button>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {properties.map((property) => {
          const isAirbnb = property.type === 'single_property';
          const isActive = activePropertyId === property.id;

          return (
            <div
              key={property.id}
              className={`bg-white rounded-xl border p-6 shadow-xs flex flex-col justify-between space-y-5 transition-all ${
                isActive
                  ? 'border-indigo-600 ring-2 ring-indigo-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Tag & Title */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                        isAirbnb ? 'bg-indigo-600' : 'bg-slate-900'
                      }`}
                    >
                      {isAirbnb ? <Home className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                        {isAirbnb ? 'Single Property (Airbnb)' : 'Bulk Property (Hotel)'}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        {property.name}
                      </h2>
                    </div>
                  </div>

                  {isActive && (
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>

                {/* Location & GST */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{property.city}, {property.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>GSTIN: {property.gstin}</span>
                  </div>
                </div>

                {/* Inventory Architecture Breakdown */}
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span>Inventory Structure ({property.totalUnits} Units Total)</span>
                    <span className="font-mono text-slate-500">SAC: {property.hsnSacCode}</span>
                  </div>

                  <div className="divide-y divide-slate-200/60 font-mono text-[11px]">
                    {property.roomTypes.map((r) => (
                      <div key={r.id} className="py-1.5 flex items-center justify-between text-slate-700">
                        <span className="font-sans font-medium">{r.name}</span>
                        <span>
                          {r.totalUnits} {r.totalUnits === 1 ? 'unit' : 'units'} · ₹{r.baseRate.toLocaleString('en-IN')}/night
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connected Channels */}
                <div className="mt-4">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    2-Way Synced OTA Channels
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {property.channels.map((ch) => (
                      <span
                        key={ch.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-800"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-semibold">{ch.name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">({ch.commissionPct}% comm.)</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setActivePropertyId(property.id);
                    onSelectPropertyToManage(property.id);
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isActive ? 'Managing This Property' : 'Switch & Manage This Property'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
