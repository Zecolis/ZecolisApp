import React from 'react';
import zecolisLogo from '../assets/zecolis_logo.png';

const SplashScreen: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-[#F8F4EE] px-5 pb-8 pt-10 text-center text-slate-900 sm:px-6">
      {/* 1) Fond mobile premium : halo orange doux + profond bleu au bas. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,168,87,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(27,61,146,0.16),transparent_28%),linear-gradient(180deg,#FCF6EF_0%,#F2EEE8_48%,#ECE8EB_100%)]" />
      <div className="absolute left-[-12%] top-10 h-72 w-72 rounded-full bg-[#FFB86F]/30 blur-3xl" />
      <div className="absolute right-[-14%] bottom-24 h-72 w-72 rounded-full bg-[#2A4B9A]/18 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6">
        {/* 2) En-tête sobre, texte entièrement centré pour mobile. */}
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-[#4B5563] shadow-sm backdrop-blur-sm">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F8F4EF] text-[#6B7280] shadow-inner">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 10V8C17 5.79 15.21 4 13 4H11C8.79 4 7 5.79 7 8V10" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="6" y="10" width="12" height="10" rx="2" stroke="#6B7280" strokeWidth="1.8"/>
                <path d="M12 15V18" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <span>Connexion sécurisée · Premium expérience</span>
          </div>
        </div>

        {/* 3) Logo réel du projet, centré et bien posé dans le splash. */}
        <div className="relative flex h-[220px] w-[220px] items-center justify-center rounded-[42px] bg-white/80 shadow-[0_32px_72px_rgba(27,43,81,0.16)] backdrop-blur-lg">
          <div className="absolute inset-0 rounded-[42px] bg-white/90" />
          <img src={zecolisLogo} alt="Zecolis logo" className="relative h-[78%] w-[78%] object-contain" />
        </div>

        {/* 4) Texte principal simple, typo premium et spacing mobile-friendly. */}
        <div className="space-y-2 px-2">
          <h1 className="text-5xl font-black tracking-[-0.04em] text-[#1D2E65] sm:text-6xl">ZECOLIS</h1>
          <p className="mx-auto max-w-xs text-base font-medium tracking-[0.02em] text-[#4F576E] sm:text-lg">Cotransportage France-Bénin</p>
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-4 pb-4">
        {/* 5) Ligne basse épurée avec parcours et indicateur. */}
        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/88 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-md">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FF8A3F]/10 text-[#D75A00] shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12L21 3L9 13L21 21L3 12Z" fill="#D75A00"/>
            </svg>
          </span>
          <span className="text-[#2F3C5B]">France</span>
          <span className="text-[#8E98A7]">→</span>
          <span className="text-[#2F3C5B]">Bénin</span>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-[#4B5563]" />
          <span>Chargement</span>
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#1D2E65]/10 text-[#1D2E65]">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.5 8.5L20.5 9.5L14.5 13.5L16 20L12 16.5L8 20L9.5 13.5L3.5 9.5L10.5 8.5L12 2Z" fill="#1D2E65" fillOpacity="0.32"/>
            </svg>
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 right-6 h-16 w-16 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute top-24 left-8 h-12 w-12 rounded-full bg-[#FFB56D]/25 blur-2xl" />
    </div>
  );
};

export default SplashScreen;
