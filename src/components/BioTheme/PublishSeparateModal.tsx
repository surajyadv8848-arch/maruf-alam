import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  FlaskConical,
  Zap,
  Globe,
} from 'lucide-react';

interface PublishSeparateModalProps {
  themeMode: 'dark' | 'light';
  isOpen: boolean;
  onClose: () => void;
  onSelectStation: (station: 'LAB' | 'QUIZ', standalone?: boolean) => void;
}

interface StationInfo {
  id: 'LAB' | 'QUIZ';
  param: string;
  stationNumber: number;
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATIONS: StationInfo[] = [
  {
    id: 'LAB',
    param: 'lab',
    stationNumber: 1,
    title: 'Lab Blood Typing Test',
    tagline: 'ABO/Rh Slide Agglutination Station',
    description: 'Pipette monoclonal Anti-A, Anti-B, and Anti-D antisera onto patient blood to observe agglutination, identify phenotype, and verify Landsteiner rules.',
    icon: FlaskConical,
  },
  {
    id: 'QUIZ',
    param: 'quiz',
    stationNumber: 2,
    title: 'Donor / Recipient Compatibility',
    tagline: 'Transfusion Compatibility Examination',
    description: 'Test emergency and routine transfusion rules across packed RBC and plasma donors and recipients with instant clinical feedback and rationale.',
    icon: Zap,
  },
];

export function PublishSeparateModal({
  themeMode,
  isOpen,
  onClose,
  onSelectStation,
}: PublishSeparateModalProps) {
  const isDark = themeMode === 'dark';
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';

  const handleCopyLink = (stationParam: string, stationId: string) => {
    const fullUrl = `${baseUrl}?station=${stationParam}&standalone=true`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(stationId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-indigo-950/80 backdrop-blur-md animate-bio-fade-in-up">
      <div
        className={`w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isDark
            ? 'bg-[#0a0d1d] border-indigo-900/60 text-slate-100 shadow-[0_0_50px_rgba(99,102,241,0.25)]'
            : 'bg-white border-indigo-100 text-slate-900 shadow-2xl shadow-indigo-500/10'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b ${
            isDark
              ? 'bg-[#0d1226] border-indigo-900/50 text-white'
              : 'bg-indigo-50/70 border-indigo-100 text-indigo-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
                isDark
                  ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border-indigo-400/40'
                  : 'bg-indigo-600 text-white border-indigo-600'
              }`}
            >
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono font-bold text-base sm:text-lg">
                  Station Deployment &amp; Publishing Center
                </h2>
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400/30'
                      : 'bg-indigo-600 text-white border-indigo-600'
                  }`}
                >
                  Made by Maruf
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-indigo-300/80' : 'text-indigo-700/80'}`}>
                Publish or launch either station as an independent standalone app
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
              isDark
                ? 'bg-indigo-950/60 border-indigo-800/60 text-indigo-300 hover:bg-indigo-900 hover:text-white'
                : 'bg-indigo-100 border-indigo-200 text-indigo-800 hover:bg-indigo-200 hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content with station list */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Info Banner */}
          <div
            className={`p-3.5 rounded-2xl border text-xs font-mono flex items-start gap-3 ${
              isDark
                ? 'bg-indigo-950/40 border-indigo-900/50 text-indigo-200'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <Globe className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Independent Standalone URL Deployment</p>
              <p className="text-[11px] opacity-90 leading-relaxed">
                Both stations support a dedicated deep-link query parameter (<code>?station=...&amp;standalone=true</code>).
                When opened via its standalone link, the station runs in an isolated, distraction-free mode as its own independent application.
              </p>
            </div>
          </div>

          {/* 2 Station Cards */}
          <div className="space-y-3">
            {STATIONS.map((st) => {
              const Icon = st.icon;
              const isCopied = copiedId === st.id;
              const directLink = `${baseUrl}?station=${st.param}&standalone=true`;

              return (
                <div
                  key={st.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDark
                      ? 'bg-indigo-950/30 border-indigo-900/50 hover:border-indigo-500/60 shadow-sm'
                      : 'bg-white border-indigo-100 hover:border-indigo-400 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                          isDark
                            ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border-indigo-400/30'
                            : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              isDark
                                ? 'bg-indigo-900/60 text-indigo-200 border-indigo-700/60'
                                : 'bg-indigo-100 text-indigo-900 border-indigo-200'
                            }`}
                          >
                            Station #{st.stationNumber}
                          </span>
                          <h3 className="font-mono font-bold text-sm">{st.title}</h3>
                        </div>
                        <div className={`text-xs font-mono font-semibold mt-0.5 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                          {st.tagline}
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-indigo-200/70' : 'text-slate-600'}`}>
                          {st.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleCopyLink(st.param, st.id)}
                        title="Copy direct standalone URL"
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : isDark
                            ? 'bg-indigo-950/60 hover:bg-indigo-900 text-indigo-200 border-indigo-800'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied Link</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Standalone Link</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          onSelectStation(st.id, true);
                          onClose();
                        }}
                        title="Launch this station as isolated standalone app"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-sm border bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-500 hover:from-indigo-500 hover:to-violet-500"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Launch Standalone</span>
                      </button>
                    </div>
                  </div>

                  {/* URL Preview code snippet */}
                  <div
                    className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                      isDark
                        ? 'border-indigo-900/40 text-indigo-400/70'
                        : 'border-indigo-100 text-indigo-600/70'
                    }`}
                  >
                    <span className="truncate max-w-[400px]">
                      URL: <code className={isDark ? 'text-indigo-300' : 'text-indigo-900 font-semibold'}>{directLink}</code>
                    </span>
                    <span className={`shrink-0 font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
                      Isolated Workspace Mode
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs font-mono ${
            isDark
              ? 'bg-[#0d1226] border-indigo-900/50 text-indigo-300/80'
              : 'bg-indigo-50/70 border-indigo-100 text-indigo-900/80'
          }`}
        >
          <span>Shareable Clinical Modules</span>
          <span className="font-bold">Made by Maruf</span>
        </div>
      </div>
    </div>
  );
}
