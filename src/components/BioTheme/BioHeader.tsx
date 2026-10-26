import React from 'react';
import { Dna, Droplet, Microscope } from 'lucide-react';

export const BioHeader: React.FC = () => {
  return (
    <header className="border-b border-[#cfe0d8] bg-[#f8fbf9] py-6 sm:py-8 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 text-center">
        {/* Microscopic Cell & DNA Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e3efe9] border border-[#bcd3c6] text-[#065f46] text-xs font-semibold uppercase tracking-wider mb-3">
          <Dna className="w-3.5 h-3.5 text-[#059669] animate-pulse" />
          <span>Molecular Hematology &amp; Immuno-Genetics</span>
          <Microscope className="w-3.5 h-3.5 text-[#059669]" />
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#064e3b] tracking-tight flex items-center justify-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-[#e11d48] text-white flex items-center justify-center text-base shadow-xs">
            <Droplet className="w-4 h-4 fill-white" />
          </span>
          <span>Blood Transfusion Compatibility Engine</span>
        </h1>

        <p className="text-sm text-[#3b6b59] max-w-2xl mx-auto mt-2 leading-relaxed">
          Interactive biological platform to identify, test, and cross-match compatible donors and recipients across ABO surface antigens and the Rhesus (RhD) protein.
        </p>
      </div>
    </header>
  );
};
