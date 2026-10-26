import React from 'react';
import { Droplet } from 'lucide-react';

export const ClassicHeader: React.FC = () => {
  return (
    <header className="border-b border-[#ded7c8] bg-[#fdfbf7] py-8 text-center">
      <div className="max-w-4xl mx-auto px-4">
        {/* Heraldic / Classic Seal Motif */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#cbbba0] bg-[#faf6ee] text-[#8b1d2c] mb-3 shadow-inner">
          <Droplet className="w-6 h-6 fill-[#8b1d2c]" />
        </div>

        <p className="text-[11px] uppercase tracking-[0.25em] text-[#8a7a65] font-semibold">
          Compendium of Immunohematology
        </p>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#29221b] tracking-tight mt-1 font-normal">
          Blood Donor &amp; Recipient Compatibility
        </h1>

        <div className="flex items-center justify-center gap-3 my-3">
          <span className="h-px w-12 bg-[#ded7c8]"></span>
          <span className="text-[#8b1d2c] text-xs">❖</span>
          <span className="h-px w-12 bg-[#ded7c8]"></span>
        </div>

        <p className="text-sm font-serif italic text-[#635647] max-w-xl mx-auto">
          An authoritative reference to determine whether a person as a donor can give, or as a recipient can receive, across the ABO and Rhesus blood systems.
        </p>
      </div>
    </header>
  );
};
