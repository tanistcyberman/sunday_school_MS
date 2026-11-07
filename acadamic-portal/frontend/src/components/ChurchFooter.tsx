import React from 'react';

export const ChurchFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#0a0f1d] border-t-2 border-[#d4af37]/60 text-slate-300 select-none overflow-hidden mt-auto">
      {/* Top Silhouette Section - Authentic Ethiopian Church Skyline */}
      <div className="relative w-full h-48 sm:h-60 flex items-end justify-center bg-gradient-to-b from-[#0f172a] via-[#0d1424] to-[#0a0f1d]">
        <svg
          viewBox="0 0 1200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full preserve-3d"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id="churchGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="skyGlow" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0f1d" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Background Mountain Silhouettes (Ethiopian Highlands / Lalibela hills) */}
          <path
            d="M0 215 L140 145 L320 185 L500 120 L720 180 L940 135 L1120 175 L1200 150 L1200 240 L0 240 Z"
            fill="url(#skyGlow)"
          />

          {/* Dashed Golden Horizon Foundation Line */}
          <line
            x1="0"
            y1="212"
            x2="1200"
            y2="212"
            stroke="#d4af37"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            opacity="0.45"
          />

          {/* ================================================================= */}
          {/* 1. LEFT STRUCTURE: BETE GIYORGIS (LALIBELA ROCK-HEWN CROSS)       */}
          {/* ================================================================= */}
          <g stroke="#d4af37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
            {/* Rock Trenches / Excavation Base */}
            <path d="M 120 212 L 280 212" strokeWidth="2.2" />
            <path d="M 135 208 L 265 208" strokeWidth="1.2" opacity="0.6" />

            {/* Stepped Plinth (3 Tiered Foundation) */}
            <rect x="150" y="196" width="100" height="12" fill="#0d1424" />
            <rect x="160" y="184" width="80" height="12" fill="#0d1424" />

            {/* Greek Cross Shape Body (Bete Giyorgis 3-Tiered Monolithic Structure) */}
            <path
              d="M 175 184 L 175 130 L 160 130 L 160 105 L 175 105 L 175 90 L 225 90 L 225 105 L 240 105 L 240 130 L 225 130 L 225 184 Z"
              fill="#0a0f1d"
              strokeWidth="2"
            />

            {/* Carved Greek Cross on Flat Roof Surface */}
            <path d="M 185 90 L 215 90 M 200 76 L 200 90" strokeWidth="2" />
            <circle cx="200" cy="74" r="2.5" fill="#d4af37" />

            {/* Iconic Lalibela Ogive & Keyhole Arched Windows with relief crosses */}
            {/* Upper Tier Windows */}
            <path d="M 193 118 L 193 104 A 7 6 0 0 1 207 104 L 207 118 Z" fill="#1e293b" />
            <line x1="200" y1="104" x2="200" y2="118" strokeWidth="1" />
            <line x1="195" y1="111" x2="205" y2="111" strokeWidth="1" />

            {/* Lower Tier Windows */}
            <path d="M 180 156 L 180 142 A 5 5 0 0 1 190 142 L 190 156 Z" fill="#1e293b" />
            <path d="M 210 156 L 210 142 A 5 5 0 0 1 220 142 L 220 156 Z" fill="#1e293b" />

            {/* Monolithic Stone String Courses (Horizontal Cornice Bands) */}
            <line x1="160" y1="130" x2="240" y2="130" strokeWidth="1.8" />
            <line x1="175" y1="160" x2="225" y2="160" strokeWidth="1.2" />
          </g>

          {/* ================================================================= */}
          {/* 2. CENTER STRUCTURE: TEWAHEDO OCTAGONAL DOME SANCTUARY (መቅደስ)   */}
          {/* ================================================================= */}
          <g stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Stepped Sanctuary Foundation */}
            <path d="M 400 212 L 720 212" strokeWidth="2.5" />
            <path d="M 420 206 L 700 206" strokeWidth="1.5" opacity="0.8" />
            <path d="M 440 200 L 680 200" strokeWidth="1.5" opacity="0.6" />

            {/* Grand Golden Orthodox Finial Cross (መስቀል) & 7 Ostrich Egg Accents */}
            <line x1="560" y1="28" x2="560" y2="60" strokeWidth="2.5" stroke="url(#churchGold)" />
            <line x1="548" y1="38" x2="572" y2="38" strokeWidth="2.5" stroke="url(#churchGold)" />
            <line x1="552" y1="46" x2="568" y2="46" strokeWidth="1.8" stroke="url(#churchGold)" />
            <circle cx="560" cy="38" r="3.5" fill="#d4af37" />
            {/* Finial Orb Base */}
            <circle cx="560" cy="58" r="4.5" fill="#d4af37" />

            {/* Apex Conical Lantern / Top Tier Roof */}
            <path d="M 560 60 L 515 82 L 605 82 Z" fill="#0d1424" strokeWidth="2" />
            
            {/* Drum Story with Arched Clerestory Windows */}
            <rect x="522" y="82" width="76" height="18" fill="#0a0f1d" strokeWidth="1.5" />
            <path d="M 540 96 L 540 88 A 4 4 0 0 1 548 88 L 548 96 Z" fill="#1e293b" strokeWidth="1.2" />
            <path d="M 572 96 L 572 88 A 4 4 0 0 1 580 88 L 580 96 Z" fill="#1e293b" strokeWidth="1.2" />

            {/* Middle Wide Octagonal Eaves Roof */}
            <path d="M 515 100 L 455 125 L 665 125 L 605 100 Z" fill="#0d1424" strokeWidth="2" />
            {/* Eave Ridge Lines for Octagonal 3D perspective */}
            <line x1="540" y1="100" x2="505" y2="125" strokeWidth="1.2" opacity="0.75" />
            <line x1="580" y1="100" x2="615" y2="125" strokeWidth="1.2" opacity="0.75" />

            {/* Upper Veranda Drum */}
            <rect x="465" y="125" width="190" height="16" fill="#0a0f1d" strokeWidth="1.5" />
            {/* Monkey Head Axumite Wood Projections */}
            <g strokeWidth="2" opacity="0.9">
              <line x1="475" y1="125" x2="475" y2="141" />
              <line x1="510" y1="125" x2="510" y2="141" />
              <line x1="610" y1="125" x2="610" y2="141" />
              <line x1="645" y1="125" x2="645" y2="141" />
            </g>

            {/* Main Expansive Lower Sloping Roof */}
            <path d="M 455 141 L 390 165 L 730 165 L 665 141 Z" fill="#0d1424" strokeWidth="2.2" />

            {/* Ground Level Sanctuary Veranda Pillars (Outer Ambulatory / ቅኔ ማህሌት) */}
            <rect x="400" y="165" width="320" height="35" fill="#0a0f1d" />
            <line x1="420" y1="165" x2="420" y2="200" strokeWidth="1.8" />
            <line x1="455" y1="165" x2="455" y2="200" strokeWidth="1.8" />
            <line x1="495" y1="165" x2="495" y2="200" strokeWidth="1.8" />
            <line x1="625" y1="165" x2="625" y2="200" strokeWidth="1.8" />
            <line x1="665" y1="165" x2="665" y2="200" strokeWidth="1.8" />
            <line x1="700" y1="165" x2="700" y2="200" strokeWidth="1.8" />

            {/* Holy Center Double Arched Doorway (የመቅደስ በር) */}
            <path d="M 545 200 L 545 174 A 15 12 0 0 1 575 174 L 575 200 Z" fill="#1e293b" strokeWidth="2.2" />
            <line x1="560" y1="165" x2="560" y2="200" strokeWidth="1.5" />
            
            {/* Traditional Geometric Wooden Lattice Railing */}
            <line x1="400" y1="188" x2="545" y2="188" strokeWidth="1.2" />
            <line x1="575" y1="188" x2="720" y2="188" strokeWidth="1.2" />
            {/* Diamond / X-cross Patterns */}
            <path d="M 420 188 L 455 200 M 455 188 L 420 200" strokeWidth="1" opacity="0.6" />
            <path d="M 455 188 L 495 200 M 495 188 L 455 200" strokeWidth="1" opacity="0.6" />
            <path d="M 625 188 L 665 200 M 665 188 L 625 200" strokeWidth="1" opacity="0.6" />
            <path d="M 665 188 L 700 200 M 700 188 L 665 200" strokeWidth="1" opacity="0.6" />
          </g>

          {/* ================================================================= */}
          {/* 3. RIGHT STRUCTURE: STEPPED BELL TOWER & DOME (የደወል ቤት)       */}
          {/* ================================================================= */}
          <g stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Bell Tower Base */}
            <path d="M 780 212 L 960 212" strokeWidth="2.5" />
            <path d="M 795 204 L 945 204" strokeWidth="1.5" opacity="0.7" />

            {/* Bell Tower Apex Cross */}
            <line x1="870" y1="24" x2="870" y2="48" strokeWidth="2.2" stroke="url(#churchGold)" />
            <line x1="861" y1="32" x2="879" y2="32" strokeWidth="2.2" stroke="url(#churchGold)" />
            <circle cx="870" cy="32" r="3" fill="#d4af37" />

            {/* Steeped Belfry Roof */}
            <path d="M 870 48 L 815 68 L 925 68 Z" fill="#0d1424" strokeWidth="2" />
            <line x1="810" y1="68" x2="930" y2="68" strokeWidth="2.5" />

            {/* Upper Belfry Chamber with Double Arches */}
            <rect x="825" y="68" width="90" height="46" fill="#0a0f1d" />
            
            {/* Left Bronze Bell Arch */}
            <path d="M 837 110 L 837 84 A 11 11 0 0 1 859 84 L 859 110 Z" fill="#1e293b" strokeWidth="1.5" />
            {/* Church Bell Silhouette */}
            <path d="M 848 78 L 848 84 M 843 94 L 853 94 L 851 84 L 845 84 Z" fill="#d4af37" strokeWidth="1.2" />

            {/* Right Bronze Bell Arch */}
            <path d="M 877 110 L 877 84 A 11 11 0 0 1 899 84 L 899 110 Z" fill="#1e293b" strokeWidth="1.5" />
            {/* Church Bell Silhouette */}
            <path d="M 888 78 L 888 84 M 883 94 L 893 94 L 891 84 L 885 84 Z" fill="#d4af37" strokeWidth="1.2" />

            {/* Mid-Tower String Cornice */}
            <line x1="820" y1="114" x2="930" y2="114" strokeWidth="2.2" />

            {/* Middle Tower Story with Axumite Windows */}
            <rect x="825" y="114" width="90" height="38" fill="#0d1424" />
            <rect x="857" y="122" width="26" height="22" strokeWidth="1.5" fill="#1e293b" />
            {/* X-Mullions */}
            <line x1="857" y1="122" x2="883" y2="144" strokeWidth="1" opacity="0.75" />
            <line x1="883" y1="122" x2="857" y2="144" strokeWidth="1" opacity="0.75" />

            {/* Lower Tower Tier & Slanted Canopy */}
            <path d="M 820 152 L 800 164 L 950 164 L 930 152 Z" fill="#0a0f1d" strokeWidth="1.8" />
            <rect x="800" y="164" width="150" height="36" fill="#0a0f1d" />

            {/* Lower Arched Gateway */}
            <path d="M 860 200 L 860 176 A 14 12 0 0 1 890 176 L 890 200 Z" fill="#1e293b" strokeWidth="2" />
            <line x1="875" y1="164" x2="875" y2="200" strokeWidth="1.2" />

            {/* Stepped Quoins Accents */}
            <g strokeWidth="2.5" opacity="0.8">
              <line x1="918" y1="76" x2="910" y2="76" />
              <line x1="918" y1="88" x2="910" y2="88" />
              <line x1="918" y1="100" x2="910" y2="100" />
              <line x1="945" y1="172" x2="936" y2="172" />
              <line x1="945" y1="184" x2="936" y2="184" />
              <line x1="945" y1="196" x2="936" y2="196" />
            </g>
          </g>
        </svg>
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
