import React, { useState, useEffect } from 'react';
import { QuizExaminer } from './components/BioTheme/QuizExaminer';
import { LabTypingTest } from './components/BioTheme/LabTypingTest';
import { PublishSeparateModal } from './components/BioTheme/PublishSeparateModal';
import { IntroSplash } from './components/BioTheme/IntroSplash';
import { GoogleDriveManager } from './components/GoogleDrive/GoogleDriveManager';
import { BloodGroup } from './types/blood';
import {
  Droplet,
  FlaskConical,
  Zap,
  Sparkles,
  HardDrive,
  Sun,
  Moon,
  Activity,
  Award,
  Share2,
  ShieldCheck,
} from 'lucide-react';

export type StationType = 'LAB' | 'QUIZ';

export default function App() {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [activeMode, setActiveMode] = useState<StationType>('LAB');
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [selectedBloodTypeForQuiz, setSelectedBloodTypeForQuiz] = useState<BloodGroup | undefined>(
    undefined
  );
  const [isDriveOpen, setIsDriveOpen] = useState<boolean>(false);
  const [pendingDriveReport, setPendingDriveReport] = useState<{
    title: string;
    bloodGroup?: string;
    details: string;
    sampleId?: string;
  } | null>(null);

  // Parse URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const stationParam = params.get('station')?.toLowerCase();
      const standaloneParam = params.get('standalone');

      if (stationParam === 'quiz' || stationParam === 'compatibility') {
        setActiveMode('QUIZ');
      } else if (stationParam === 'lab' || stationParam === 'typing') {
        setActiveMode('LAB');
      }

      if (standaloneParam === 'true' || standaloneParam === '1') {
        setIsStandalone(true);
        // Skip intro in standalone direct link mode for instantaneous app boot
        setShowIntro(false);
      }
    }
  }, []);

  const isDark = themeMode === 'dark';

  const updateStation = (newStation: StationType, standalone = false) => {
    setActiveMode(newStation);
    if (standalone) {
      setIsStandalone(true);
    }
    if (typeof window !== 'undefined') {
      const paramMap: Record<StationType, string> = {
        LAB: 'lab',
        QUIZ: 'quiz',
      };
      const url = new URL(window.location.href);
      url.searchParams.set('station', paramMap[newStation]);
      if (standalone || isStandalone) {
        url.searchParams.set('standalone', 'true');
      } else {
        url.searchParams.delete('standalone');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleExitStandalone = () => {
    setIsStandalone(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('standalone');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSaveToDrive = (report: {
    title: string;
    bloodGroup?: string;
    details: string;
    sampleId?: string;
  }) => {
    setPendingDriveReport(report);
    setIsDriveOpen(true);
  };

  const handleTestCompatibility = (bloodType: BloodGroup) => {
    setSelectedBloodTypeForQuiz(bloodType);
    updateStation('QUIZ');
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const stationLabels: Record<
    StationType,
    { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    LAB: {
      title: 'Lab Blood Typing Test',
      subtitle: 'ABO/Rh Slide Agglutination',
      icon: FlaskConical,
    },
    QUIZ: {
      title: 'Donor/Recipient Quiz',
      subtitle: 'Compatibility Examiner',
      icon: Zap,
    },
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark
          ? 'clinical-grid-dark text-slate-100 selection:bg-violet-600 selection:text-white'
          : 'clinical-grid-light text-slate-900 selection:bg-indigo-600 selection:text-white'
      }`}
    >
      {/* Short Opening Animation on Startup */}
      {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}

      {/* Standalone Mode Banner */}
      {isStandalone && (
        <div
          className={`border-b px-4 py-2 text-xs font-mono flex items-center justify-between shadow-lg ${
            isDark
              ? 'bg-indigo-950/90 border-indigo-900 text-indigo-100'
              : 'bg-indigo-900 border-indigo-800 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
            <span className="font-bold tracking-tight">
              Standalone App: {stationLabels[activeMode].title}
            </span>
            <span className="hidden sm:inline text-indigo-200 font-medium">· Made by Maruf</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="text-xs text-indigo-200 hover:text-white underline cursor-pointer"
            >
              Publish Info
            </button>
            <span className="text-indigo-400">|</span>
            <button
              onClick={handleExitStandalone}
              className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white text-indigo-950 hover:bg-indigo-50 border border-white cursor-pointer transition-all"
            >
              Switch to All Stations Hub
            </button>
          </div>
        </div>
      )}

      {/* Royal Indigo & Violet Header */}
      <header
        className={`border-b py-3.5 sm:py-4 shadow-sm animate-bio-fade-in-up transition-colors sticky top-0 z-40 backdrop-blur-md ${
          isDark
            ? 'bg-[#080b16]/90 border-indigo-900/40 shadow-indigo-950/50'
            : 'bg-white/95 border-indigo-100 shadow-indigo-500/5'
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          {/* Top Control Bar: Made by Maruf + Controls */}
          <div className="flex items-center justify-between mb-2.5">
            {/* Author Credit Badge */}
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border tracking-wide transition-all ${
                  isDark
                    ? 'bg-gradient-to-r from-indigo-900/80 to-violet-900/80 border-indigo-700/60 text-indigo-200 shadow-sm'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-600 text-white shadow-sm'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Made by Maruf</span>
              </span>
              <span
                className={`hidden md:inline-flex items-center gap-1 text-[10px] uppercase tracking-widest ${
                  isDark ? 'text-indigo-400' : 'text-indigo-600'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                <span>Diagnostic Standard</span>
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Separate Publishing Hub Button */}
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                title="Publish or share each station as a separate standalone app"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all shadow-xs cursor-pointer ${
                  isDark
                    ? 'bg-indigo-950/60 border-indigo-800/60 hover:border-indigo-400 text-indigo-200 hover:text-white hover:bg-indigo-900/60'
                    : 'bg-indigo-50 border-indigo-200 hover:border-indigo-400 text-indigo-900 hover:bg-indigo-100'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-current" />
                <span className="hidden sm:inline">Publish Separately</span>
                <span className="sm:hidden">Publish</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? 'Switch to Clinical White Theme' : 'Switch to Pitch Black Theme'}
                className={`p-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-indigo-950/60 border-indigo-800/60 hover:bg-indigo-900/60 text-indigo-200 hover:text-white'
                    : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-900'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-700" />}
              </button>

              {/* Replay Intro */}
              <button
                type="button"
                onClick={() => setShowIntro(true)}
                title="Replay intro sequence"
                className={`p-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-indigo-950/60 border-indigo-800/60 hover:bg-indigo-900/60 text-indigo-300 hover:text-white'
                    : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Google Drive Archive Button */}
              <button
                type="button"
                onClick={() => {
                  setPendingDriveReport(null);
                  setIsDriveOpen(true);
                }}
                title="Google Drive Storage & Clinical Reports"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all shadow-xs cursor-pointer ${
                  isDark
                    ? 'bg-indigo-950/60 border-indigo-800/60 hover:border-indigo-400 text-indigo-200 hover:text-white hover:bg-indigo-900/60'
                    : 'bg-white border-indigo-200 hover:border-indigo-400 text-indigo-900 hover:bg-indigo-50'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5 text-current" />
                <span className="hidden sm:inline">Drive Files</span>
              </button>
            </div>
          </div>

          {/* Main Title */}
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center justify-center gap-2.5">
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-md border ${
                  isDark
                    ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                    : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border-indigo-500 shadow-indigo-300'
                }`}
              >
                <Droplet className="w-4 h-4 fill-white stroke-white" />
              </span>
              <span className={`tracking-wider font-extrabold ${isDark ? 'text-white' : 'text-indigo-950'}`}>
                HEMOMATCH LAB
              </span>
            </h1>

            <p
              className={`text-xs font-mono mt-1 max-w-lg font-medium tracking-wide ${
                isDark ? 'text-indigo-300/80' : 'text-indigo-800/80'
              }`}
            >
              ABO/Rh Slide Agglutination &amp; Transfusion Compatibility Suite
            </p>
          </div>

          {/* 2 Core Stations Segmented Control */}
          {!isStandalone && (
            <div
              className={`mt-4 p-1.5 rounded-2xl border grid grid-cols-2 gap-2 text-xs font-mono transition-all max-w-xl mx-auto ${
                isDark
                  ? 'bg-indigo-950/40 border-indigo-900/60 shadow-inner'
                  : 'bg-indigo-50/80 border-indigo-200/80 shadow-inner'
              }`}
            >
              {/* Station 1: Lab Blood Typing */}
              <button
                type="button"
                onClick={() => updateStation('LAB')}
                className={`relative flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl font-bold transition-all cursor-pointer ${
                  activeMode === 'LAB'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                    : isDark
                    ? 'text-indigo-300/70 hover:text-white hover:bg-indigo-900/30'
                    : 'text-indigo-800/70 hover:text-indigo-950 hover:bg-indigo-100/60'
                }`}
              >
                <FlaskConical className="w-4 h-4 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black tracking-wide">1. Blood Typing Lab</span>
                  <span className="text-[10px] opacity-85 font-normal">ABO/Rh Antisera Slide</span>
                </div>
              </button>

              {/* Station 2: Compatibility Quiz */}
              <button
                type="button"
                onClick={() => updateStation('QUIZ')}
                className={`relative flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl font-bold transition-all cursor-pointer ${
                  activeMode === 'QUIZ'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                    : isDark
                    ? 'text-indigo-300/70 hover:text-white hover:bg-indigo-900/30'
                    : 'text-indigo-800/70 hover:text-indigo-950 hover:bg-indigo-100/60'
                }`}
              >
                <Zap className="w-4 h-4 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black tracking-wide">2. Compatibility Quiz</span>
                  <span className="text-[10px] opacity-85 font-normal">Donor &amp; Recipient Rules</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Primary Stage */}
      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8 flex-1 w-full animate-bio-fade-in-up">
        {activeMode === 'LAB' && (
          <LabTypingTest
            themeMode={themeMode}
            onTestCompatibility={handleTestCompatibility}
            onSaveToDrive={handleSaveToDrive}
          />
        )}

        {activeMode === 'QUIZ' && (
          <QuizExaminer
            themeMode={themeMode}
            initialBloodType={selectedBloodTypeForQuiz}
            onSaveToDrive={handleSaveToDrive}
          />
        )}
      </main>

      {/* Separate Publishing & Standalone Hub Modal */}
      <PublishSeparateModal
        themeMode={themeMode}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSelectStation={(st, standalone) => updateStation(st, standalone)}
      />

      {/* Google Drive Storage Modal */}
      <GoogleDriveManager
        themeMode={themeMode}
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        currentReportData={pendingDriveReport}
      />

      {/* Royal Indigo & Violet Footer */}
      <footer
        className={`border-t py-4 text-center text-xs font-mono transition-colors ${
          isDark
            ? 'border-indigo-900/40 bg-[#070a14] text-indigo-300/80'
            : 'border-indigo-100 bg-white text-indigo-900/80'
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-semibold">Immunohematology Diagnostic Suite · 2 Core Stations</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="inline-flex items-center gap-1 hover:underline font-bold transition-colors cursor-pointer text-current"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Publish Separately</span>
            </button>

            <span className="text-indigo-400/40">·</span>

            <button
              onClick={() => {
                setPendingDriveReport(null);
                setIsDriveOpen(true);
              }}
              className="inline-flex items-center gap-1 hover:underline font-bold transition-colors cursor-pointer text-current"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Drive Files</span>
            </button>

            <span className="text-indigo-400/40">·</span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border font-bold tracking-wide ${
                isDark
                  ? 'bg-gradient-to-r from-indigo-900/90 to-violet-900/90 border-indigo-700/60 text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-600 text-white'
              }`}
            >
              <Award className="w-3 h-3 text-amber-300" />
              <span>Made by Maruf</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
