import React from 'react';
import { ChevronRight, ShieldCheck, Sparkles, Package, Plane, CircleCheckBig } from 'lucide-react';

interface OnboardingViewProps {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  accent: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  onNext: () => void;
  onSkip?: () => void;
}

const stepHighlights: Record<1 | 2 | 3, Array<{ label: string; icon: React.ReactNode }>> = {
  1: [
    { label: 'Expérience guidée', icon: <Sparkles size={14} /> },
    { label: 'Démarrage rapide', icon: <CircleCheckBig size={14} /> },
    { label: 'Interface claire', icon: <ShieldCheck size={14} /> }
  ],
  2: [
    { label: 'Suivi de confiance', icon: <ShieldCheck size={14} /> },
    { label: 'Colis tracés', icon: <Package size={14} /> },
    { label: 'Voyageurs vérifiés', icon: <Plane size={14} /> }
  ],
  3: [
    { label: 'Prêt à se connecter', icon: <CircleCheckBig size={14} /> },
    { label: 'Compte sécurisé', icon: <ShieldCheck size={14} /> },
    { label: 'Accès immédiat', icon: <Sparkles size={14} /> }
  ]
};

const progressLabel = (step: 1 | 2 | 3) => `${step}/3`;

const OnboardingView: React.FC<OnboardingViewProps> = ({
  step,
  title,
  subtitle,
  image,
  badge,
  accent,
  primaryActionLabel,
  secondaryActionLabel,
  onNext,
  onSkip
}) => {
  const highlights = stepHighlights[step];
  const progress = (step / 3) * 100;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,87,34,0.10),transparent_32%),radial-gradient(circle_at_top_right,_rgba(29,29,75,0.12),transparent_28%),linear-gradient(180deg,#F7F4EE_0%,#FFFFFF_42%,#FBFBFC_100%)] px-5 py-6 flex flex-col">
      {/* 1) Fond premium avec halos et dégradés doux pour isoler l'onboarding de l'authentification. */}
      <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[#1D1D4B]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-36 -right-24 h-72 w-72 rounded-full bg-[#FF5722]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#1D1D4B]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1D1D4B] shadow-[0_12px_30px_rgba(29,29,75,0.25)]">
            <span className="text-xl font-black tracking-tight text-white">ZE</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#1D1D4B]/45">Zecolis</p>
            <p className="text-sm font-semibold text-[#1D1D4B]">Bienvenue à bord</p>
          </div>
        </div>

        <div className="rounded-full border border-white/70 bg-white/85 px-3 py-1.5 shadow-[0_10px_30px_rgba(29,29,75,0.08)] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1D1D4B]">Étape {progressLabel(step)}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-5">
        {/* 2) Barre d'avancement claire pour matérialiser la progression en trois pages distinctes. */}
        <div className="h-1.5 w-full rounded-full bg-[#1D1D4B]/8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #1D1D4B)` }}
          />
        </div>
      </div>

      <section className="relative z-10 flex-1 overflow-hidden rounded-[34px] border border-white/70 bg-[#0E1024] shadow-[0_28px_80px_rgba(29,29,75,0.18)]">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090B18]/96 via-[#0E1024]/72 to-transparent" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}1F 0%, transparent 45%)` }} />

        <div className="relative flex h-full min-h-[72vh] flex-col justify-between p-5 text-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/12 px-3 py-1.5 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#FF5722]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.22em]">{badge}</span>
              </div>

              <div className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
                  Expérience premium
                </span>
              </div>
            </div>

            <div className="max-w-[320px] space-y-3">
              <h1 className="text-4xl font-black leading-[0.98] tracking-tight drop-shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
                {title}
              </h1>
              <p className="text-sm leading-relaxed text-white/84">
                {subtitle}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-md shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
                >
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/12 text-white">
                    {item.icon}
                  </div>
                  <p className="text-[11px] font-semibold leading-snug text-white/88">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* 3) Carte d'action finale: infos clés, bénéfices, puis CTA de sortie vers la page d'authentification. */}
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">Ce que vous gagnez</p>
                  <p className="text-sm font-semibold text-white">Un parcours plus fluide et plus rassurant</p>
                </div>
                <div className="h-10 w-10 rounded-2xl border border-white/12 bg-white/12 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-white/75">
                  <span>Clarté</span>
                  <span>+ premium</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #FFFFFF)` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSkip}
                className="rounded-full border border-white/12 bg-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/88 backdrop-blur-md transition-transform active:scale-[0.98]"
              >
                Passer
              </button>

              <button
                type="button"
                onClick={onNext}
                className="flex flex-1 items-center justify-center gap-2 rounded-[18px] bg-white py-4 text-sm font-bold text-[#1D1D4B] shadow-[0_16px_40px_rgba(255,255,255,0.18)] transition-transform active:scale-[0.99]"
              >
                {primaryActionLabel}
                <ChevronRight size={18} />
              </button>
            </div>

            {secondaryActionLabel ? (
              <p className="text-center text-[11px] font-medium text-white/66">
                {secondaryActionLabel}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnboardingView;
