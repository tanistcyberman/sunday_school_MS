import React from 'react';

export const ChurchFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#0a0f1d] border-t-2 border-[#d4af37]/60 text-slate-300 select-none overflow-hidden mt-auto">
      {/* Top Silhouette Section - Authentic Ethiopian Church Skyline */}
      <div className="relative w-full h-44 sm:h-56 md:h-64 flex items-end justify-center bg-gradient-to-b from-[#0f172a] via-[#0d1424] to-[#0a0f1d] overflow-hidden">
        {/* Subtle Golden Horizon Foundation Glow Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent z-10" />

        {/* Authentic Church Skyline Vector Background */}
        <img
          src="/potrace_gold.svg"
          alt="Ethiopian Orthodox Church Skyline"
          className="w-full h-full object-contain object-bottom pointer-events-none select-none drop-shadow-[0_0_25px_rgba(212,175,55,0.12)]"
        />
      </div>

      {/* Bottom Legal & Department Information Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
        
        {/* Left Branding */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#d4af37]/70 bg-[#111a2e] flex items-center justify-center shadow-inner shrink-0">
            {/* Traditional Orthodox Cross Icon */}
            <svg className="w-6 h-6 text-[#d4af37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M8 7h8M9 11h6M10 15h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm sm:text-base tracking-wide font-['Noto_Sans_Ethiopic']">
              የቀጣይ ትምህርት ክትትል ክፍል
            </h3>
            <p className="text-[#d4af37] text-xs font-medium font-['Noto_Sans_Ethiopic']">
              ትውልድን በእውቀትና በሃይማኖት ማነፅ
            </p>
          </div>
        </div>

        {/* Right Notice (Strictly removed 4-10 bumper per user request) */}
        <div className="text-center sm:text-right">
          <p className="text-slate-300 text-xs font-['Noto_Sans_Ethiopic']">
            © 2026 መብቱ በህግ የተጠበቀ ነው። የትምህርትና ፈተና ክትትል ስርዓት።
          </p>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Strictly fulfilling Continuous Education Monitoring mandate
          </p>
        </div>

      </div>
    </footer>
  );
};

export default ChurchFooter;
