import React from 'react';
import { Activity, ShieldAlert, FlaskConical, Users, BookOpen, RotateCcw } from 'lucide-react';

export type ActiveTab = 'MATCHING' | 'TYPING_LAB' | 'TRAUMA_SIM' | 'REGISTRY' | 'MATRIX';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  criticalCount: number;
  totalDonors: number;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  criticalCount,
  totalDonors,
  onResetData,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'MATCHING', label: 'Matching Ground', icon: <Activity className="w-4 h-4" /> },
    { id: 'TYPING_LAB', label: 'Bedside Typing Lab', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'TRAUMA_SIM', label: 'Emergency Trauma Sim', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'REGISTRY', label: 'Registry & Requests', icon: <Users className="w-4 h-4" /> },
    { id: 'MATRIX', label: 'Compatibility Matrix', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Clinical Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs">
            <span className="font-bold text-lg tracking-tight">H+</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight leading-none">
                HemoMatch
              </h1>
              <span className="text-xs text-rose-700 font-medium bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                Clinical v3.4
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Virtual Blood Donor & Recipient Identification Ground
            </p>
          </div>
        </div>

        {/* Global Vital Stats & Quick Reset */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-medium text-slate-900">{totalDonors}</span>
            <span>Registered Donors</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-medium text-rose-700 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              {criticalCount} Critical Requests
            </span>
          </div>

          <button
            onClick={onResetData}
            title="Reset to default mock hospital data"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors py-1 px-2.5 rounded border border-slate-200 hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-1 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-rose-600 text-rose-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
