import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import zecolisLogo from '../assets/zecolis_logo.png';

interface OnboardingViewProps {
  step: 1 | 2 | 3;
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  backgroundImage: string;
  backgroundPosition?: string;
  chips?: string[];
  ctaLabel: string;
  onNext: () => void;
  onSkip: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({
  step,
  eyebrow,
  title,
  subtitle,
  backgroundImage,
  backgroundPosition = 'center center',
  chips,
  ctaLabel,
  onNext,
  onSkip
}) => {
  const [isReady, setIsReady] = useState(false);
  const progress = step === 1 ? 34 : step === 2 ? 67 : 100;
  const safeAreaStyle = {
    paddingTop: 'max(16px, env(safe-area-inset-top))',
    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
    paddingLeft: 'max(16px, env(safe-area-inset-left))',
    paddingRight: 'max(16px, env(safe-area-inset-right))'
  } as React.CSSProperties;

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setIsReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden bg-[#FCFBF8] text-[#0B2A5B]"
      style={safeAreaStyle}
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition,
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,42,91,0.08)_0%,rgba(11,42,91,0.04)_22%,rgba(11,42,91,0.10)_48%,rgba(11,42,91,0.72)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_center,rgba(255,107,0,0.08),transparent_34%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[540px] flex-col px-5">
        <header className="flex items-center justify-between gap-4 pt-1">
          <div
            className={`flex items-center gap-3 transition-all duration-500 ease-out ${
              isReady ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            <img
              src={zecolisLogo}
              alt="ZE Colis"
              className="h-11 w-11 rounded-2xl object-contain shadow-[0_10px_30px_rgba(11,42,91,0.10)]"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#0B2A5B]/55">
                ZE Colis
              </p>
              <p className="text-sm font-semibold text-[#0B2A5B]">Premium onboarding</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-[#0B2A5B]/70 transition-all duration-500 hover:text-[#0B2A5B] active:scale-[0.98] ${
              isReady ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            Passer
            <ChevronRight size={18} />
          </button>
        </header>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/24">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#FF6B00_0%,#FF8A3D_55%,#22A55A_120%)] shadow-[0_0_20px_rgba(255,107,0,0.45)] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <main className="flex flex-1 flex-col justify-end gap-4 pb-4 pt-5">
          <section className={`space-y-3 transition-all duration-700 ease-out ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {chips?.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/18 bg-white/14 px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(11,42,91,0.08)] backdrop-blur-md"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}

            <div
              className={`rounded-[34px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.10)_100%)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.20)] backdrop-blur-xl transition-all duration-700 ease-out ${
                isReady ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                <span className="h-2 w-2 rounded-full bg-[#22A55A]" />
                {eyebrow}
              </div>
              <h2 className="mt-3 max-w-[14ch] text-[clamp(1.75rem,5vw,2.6rem)] font-black leading-[0.95] tracking-[-0.04em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.24)]">
                {title}
              </h2>
              <p className="mt-3 max-w-[30ch] text-[clamp(0.95rem,2.7vw,1.05rem)] leading-relaxed text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)]">
                {subtitle}
              </p>

              <div className="mt-4 flex items-center justify-center gap-2">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      dot === step - 1 ? 'w-8 bg-white' : 'w-4 bg-white/28'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={onNext}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#FF6B00] px-5 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(255,107,0,0.30)] transition-transform duration-200 active:scale-[0.99]"
              >
                {ctaLabel}
                <ChevronRight size={20} />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default OnboardingView;
