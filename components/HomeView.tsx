import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Eye,
  Lock,
  MapPin,
  Package,
  Plane,
  ShieldCheck,
  Star,
  Truck,
  MessageSquare
} from 'lucide-react';
import { Ad, User } from '../types';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import headerHeroImage from '../assets/header.jpeg';
import parcelCardImage from '../assets/carte 2.png';

interface HomeViewProps {
  currentUser: User | null;
  onParcelClick?: () => void;
  onTripClick?: () => void;
  onSelectUser: (user: { name: string, initials: string, rating: number, uid?: string }) => void;
  onSeeAllRecent: () => void;
  onSeeAllTransactions: () => void;
  onSelectAd: (ad: Ad) => void;
  onNotificationClick: () => void;
  onVerifyClick?: () => void;
  unreadCount?: number;
}

// Petite carte d'action principale, inspirée de la référence.
const ActionCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  className: string;
  onClick?: () => void;
}> = ({ title, subtitle, icon, className, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative overflow-hidden rounded-[28px] p-5 text-left shadow-[0_18px_40px_rgba(29,29,75,0.12)] active:scale-[0.99] ${className}`}
  >
    <div className="absolute right-0 top-0 h-24 w-24 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-2xl" />
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 text-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/78">{title}</p>
          <p className="mt-2 max-w-[13ch] text-xl font-black leading-[1.02] text-white">{subtitle}</p>
        </div>
      </div>
      <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#1D1D4B] shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-transform group-active:scale-95">
        <ArrowRight size={18} />
      </div>
    </div>
  </button>
);

// Carte compacte commune pour les rails horizontaux.
const RailCard: React.FC<{
  className?: string;
  onClick?: () => void;
  visualUrl?: string;
  visualLabel?: string;
  children: React.ReactNode;
}> = ({ className = '', onClick, visualUrl, visualLabel, children }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.();
      }
    }}
    className={`snap-start overflow-hidden rounded-[24px] bg-white text-left shadow-[0_14px_36px_rgba(29,29,75,0.08)] ring-1 ring-black/5 active:scale-[0.99] ${className}`}
  >
    {visualUrl ? (
      <div className="relative h-28 overflow-hidden">
        <img src={visualUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,42,91,0.06)_0%,rgba(11,42,91,0.44)_100%)]" />
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
          {visualLabel ? (
            <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0B2A5B] shadow-[0_8px_18px_rgba(0,0,0,0.12)] backdrop-blur-md">
              {visualLabel}
            </span>
          ) : <span />}
          <span className="rounded-full bg-[#FF6B00] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_8px_18px_rgba(255,107,0,0.22)]">
            Voir
          </span>
        </div>
      </div>
    ) : null}
    <div className="p-4">
      {children}
    </div>
  </div>
);

const ParcelHeroIllustration: React.FC = () => (
  <div className="relative h-[110px] w-full overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#FFF6EC_0%,#FFF9F4_100%)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,107,0,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(11,42,91,0.05),transparent_26%)]" />

    <div className="absolute left-[12px] top-[12px] rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-[#FF6B00] shadow-[0_10px_20px_rgba(0,0,0,0.08)] backdrop-blur-md">
      Photo
    </div>

    <div className="absolute left-[14px] top-[40px] h-8 w-8 rounded-full bg-[#2BB673] text-white shadow-[0_14px_24px_rgba(43,182,115,0.28)]">
      <div className="flex h-full w-full items-center justify-center">
        <ShieldCheck size={18} className="fill-white" />
      </div>
    </div>

    <div className="absolute right-[10px] bottom-[8px] h-[90px] w-[126px] overflow-hidden rounded-[18px] bg-white/55 shadow-[0_16px_32px_rgba(0,0,0,0.10)] ring-1 ring-white/80 backdrop-blur-[2px]">
      <img
        src={parcelCardImage}
        alt="Colis sécurisé"
        className="h-full w-full object-contain object-right-bottom"
      />
    </div>

    <div className="absolute left-[14px] bottom-[10px] flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-[9px] font-semibold text-[#0B2A5B] shadow-[0_10px_20px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <Lock size={11} className="text-[#FF6B00]" />
      Suivi sécurisé
    </div>
  </div>
);

const HeroVisualFrame: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = '', children }) => (
  <div className={`relative flex h-[110px] w-full items-center justify-center overflow-hidden rounded-[22px] ${className}`}>
    {children}
  </div>
);

const ExchangeHeroIllustration: React.FC = () => (
  <HeroVisualFrame className="bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_30%)]" />

    <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
      <BadgeCheck size={15} className="text-[#22A55A]" />
    </div>

    <div className="absolute left-4 bottom-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/90 ring-1 ring-white/10">
      <span className="text-[10px] font-black uppercase">RB</span>
    </div>

    <div className="absolute left-[42px] top-[50px] h-px w-[44px] bg-white/30" />
    <div className="absolute left-[82px] top-[50px] h-[1px] w-[22px] bg-white/25" />
    <div className="absolute left-[56px] top-[44px] h-2 w-2 rounded-full bg-[#FF6B00] shadow-[0_0_0_4px_rgba(255,107,0,0.12)]" />

    <div className="absolute right-5 bottom-4 h-20 w-[66px] rounded-[18px] bg-[#0B2A5B] shadow-[0_16px_28px_rgba(11,42,91,0.16)] ring-1 ring-white/12">
      <div className="absolute inset-x-3 top-3 h-1.5 rounded-full bg-white/20" />
      <div className="absolute left-1/2 top-7 h-8 w-8 -translate-x-1/2 rounded-full bg-white/95 text-[#0B2A5B] shadow-[0_8px_18px_rgba(0,0,0,0.12)]">
        <div className="flex h-full w-full items-center justify-center">
          <Lock size={16} />
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 h-3 w-10 -translate-x-1/2 rounded-full bg-white/10" />
    </div>

    <div className="absolute right-[74px] top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#0B2A5B]/10 text-[#0B2A5B] ring-1 ring-white/10">
      <ShieldCheck size={18} />
    </div>
  </HeroVisualFrame>
);

const VerifiedHeroIllustration: React.FC<{ score: number }> = ({ score }) => (
  <HeroVisualFrame className="bg-[linear-gradient(180deg,rgba(11,42,91,0.04)_0%,rgba(11,42,91,0.015)_100%)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,165,90,0.14),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(255,107,0,0.08),transparent_30%)]" />

    <div className="absolute left-4 top-4 h-11 w-11 rounded-full border border-[#22A55A]/20 bg-white shadow-[0_14px_24px_rgba(11,42,91,0.08)]">
      <div className="flex h-full w-full items-center justify-center text-[#22A55A]">
        <BadgeCheck size={22} />
      </div>
    </div>

    <div className="absolute left-[48px] top-[38px] h-14 w-14 rounded-full border-[6px] border-[#0B2A5B]/8 bg-transparent">
      <div
        className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-[#FF6B00] border-r-[#FFB15A] border-b-[#22A55A] border-l-[#FF6B00] opacity-90"
        style={{ transform: 'rotate(18deg)' }}
      />
      <div className="absolute inset-2 rounded-full bg-white shadow-[0_10px_20px_rgba(11,42,91,0.08)]">
        <div className="flex h-full w-full items-center justify-center text-[#0B2A5B]">
          <ShieldCheck size={18} />
        </div>
      </div>
    </div>

    <div className="absolute right-4 top-5 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#22A55A] shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
      Vérifié
    </div>

    <div className="absolute right-4 bottom-4 rounded-[18px] bg-[#0B2A5B] px-3 py-2 text-white shadow-[0_14px_26px_rgba(11,42,91,0.16)]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
        Niveau
      </div>
      <div className="mt-0.5 text-[18px] font-black leading-none">
        {score}%
      </div>
    </div>
  </HeroVisualFrame>
);

// Hero du haut: fond décoratif, overlay lisible et cartes de confiance en glassmorphism léger.
const HomeHeroSection: React.FC<{
  currentUser: User | null;
  avatarInitials: string;
  firstName: string;
  onVerifyClick?: () => void;
  onMessagesClick?: () => void;
  onNotificationClick: () => void;
  unreadCount?: number;
  bannerIndex: number;
  trustScore: number;
  isFullyVerified: boolean;
  completedChecks: Array<{ key: string; label: string; done: boolean }>;
}> = ({
  currentUser,
  avatarInitials,
  firstName,
  onVerifyClick,
  onMessagesClick,
  onNotificationClick,
  unreadCount = 0,
  bannerIndex,
  trustScore,
  isFullyVerified,
  completedChecks
}) => (
  <section className="relative overflow-hidden rounded-[34px] shadow-[0_22px_60px_rgba(11,42,91,0.10)] ring-1 ring-black/5">
    {/* Fond héros: image en couverture + overlay clair pour préserver la lisibilité. */}
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: `url(${headerHeroImage})`,
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.74)_0%,rgba(255,255,255,0.58)_100%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,107,0,0.08),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(11,42,91,0.06),transparent_30%)]" />

    <div className="relative z-10 flex min-h-[198px] flex-col gap-2.5 px-4 pb-3 pt-3 sm:min-h-[212px] sm:px-5">
      {/* En-tête compact: avatar, nom, pays et actions rapides au-dessus du fond. */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onVerifyClick}
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95 shadow-[0_14px_30px_rgba(11,42,91,0.12)] ring-1 ring-white/70 backdrop-blur-md active:scale-95"
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt={currentUser.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-black text-[#0B2A5B]">{avatarInitials}</span>
            )}
          </button>

          <div className="min-w-0">
            <div className="text-[11px] font-medium text-[#0B2A5B]/58">
              Bonjour, <span className="font-semibold text-[#0B2A5B]">{firstName}</span>
            </div>
            <p className="mt-0.5 truncate text-[17px] font-black tracking-[-0.03em] text-[#0B2A5B]">
              {currentUser?.name || 'Utilisateur'}
            </p>
            <p className="mt-1 flex items-center gap-2 text-[11px] font-medium text-[#0B2A5B]/62">
              <span>France</span>
              <span className="text-[#0B2A5B]/25">↔</span>
              <span>Bénin</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMessagesClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-[#0B2A5B] shadow-[0_12px_24px_rgba(11,42,91,0.10)] ring-1 ring-white/70 backdrop-blur-md active:scale-95"
          >
            <MessageSquare size={17} />
          </button>
          <button
            type="button"
            onClick={onNotificationClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-[#0B2A5B] shadow-[0_12px_24px_rgba(11,42,91,0.10)] ring-1 ring-white/70 backdrop-blur-md active:scale-95"
          >
            <Bell size={17} />
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] font-bold text-white shadow-[0_10px_20px_rgba(255,107,0,0.32)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      {/* Carrousel premium en 3 cartes: confiance, sécurité des échanges et colis sécurisés. */}
      <div className="flex flex-1 justify-center">
        <div className="w-full max-w-[100%] overflow-hidden rounded-[30px]">
          <div
            className="flex w-[300%] transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${bannerIndex * 33.333}%)` }}
          >
            <div className="w-1/3 pr-2">
              <button
                type="button"
                className="relative flex h-[210px] w-full overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#132F6B_0%,#091F47_100%)] p-5 text-left shadow-[0_20px_44px_rgba(11,42,91,0.20)] ring-1 ring-white/10 active:scale-[0.99]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%),linear-gradient(135deg,rgba(11,42,91,0.96)_0%,rgba(11,42,91,0.84)_100%)]" />
                <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                <div className="relative z-10 grid h-full w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
                  <div className="flex min-w-0 flex-col justify-between gap-3">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
                        <Lock size={12} />
                        Échanges protégés
                      </div>
                      <p className="mt-2 max-w-[15ch] text-[17px] font-black leading-[1.03] tracking-[-0.04em] text-white sm:text-[18px]">
                        Protection active pour vos échanges
                      </p>
                      <p className="mt-2 max-w-[22ch] text-[11px] leading-relaxed text-white/72">
                        Vos échanges sont chiffrés, sécurisés et surveillés en permanence.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <span className="rounded-full bg-white/12 px-3 py-2 text-[10px] font-semibold text-white/92 backdrop-blur-md">
                        Paiement sûr
                      </span>
                      <span className="rounded-full bg-white/12 px-3 py-2 text-[10px] font-semibold text-white/92 backdrop-blur-md">
                        Données protégées
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0B2A5B] shadow-[0_12px_24px_rgba(0,0,0,0.10)]">
                      <ChevronRight size={16} />
                    </div>
                    <ExchangeHeroIllustration />
                  </div>
                </div>
              </button>
            </div>

            <div className="w-1/3 px-2">
              <button
                type="button"
                className="relative flex h-[210px] w-full overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#FFF3E5_0%,#FFF9F3_100%)] p-5 text-left shadow-[0_20px_44px_rgba(11,42,91,0.10)] ring-1 ring-white/80 active:scale-[0.99]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,107,0,0.10),transparent_28%),linear-gradient(135deg,rgba(255,243,229,0.96)_0%,rgba(255,249,243,0.90)_100%)]" />
                <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#FF6B00]/10 blur-2xl" />
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-[#FF6B00] shadow-[0_10px_20px_rgba(0,0,0,0.08)] backdrop-blur-md">
                  Photo
                </div>

                <div className="relative z-10 grid h-full w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
                  <div className="flex min-w-0 flex-col justify-between gap-3">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF0E5] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF6B00]">
                        <Package size={12} />
                        Colis sécurisés
                      </div>
                      <p className="mt-2 max-w-[15ch] text-[17px] font-black leading-[1.02] tracking-[-0.04em] text-[#0B2A5B]">
                        Vos colis restent suivis et protégés
                      </p>
                      <p className="mt-2 max-w-[24ch] text-[11px] leading-relaxed text-[#0B2A5B]/68">
                        Chaque colis bénéficie d'un suivi en temps réel jusqu'à destination.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span className="rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-semibold text-[#0B2A5B] shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
                        Emballage sûr
                      </span>
                      <span className="rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-semibold text-[#0B2A5B] shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
                        Suivi précis
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B2A5B] text-white shadow-[0_12px_24px_rgba(0,0,0,0.10)]">
                      <ChevronRight size={16} />
                    </div>
                    <ParcelHeroIllustration />
                  </div>
                </div>
              </button>
            </div>

            <div className="w-1/3 pl-2">
              <button
                type="button"
                className="relative flex h-[210px] w-full overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFBFD_100%)] p-5 text-left shadow-[0_18px_36px_rgba(11,42,91,0.08)] ring-1 ring-white/80 active:scale-[0.99]"
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#FF6B00]/8 blur-2xl" />
                <div className="relative z-10 grid h-full w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
                  <div className="flex min-w-0 flex-col justify-between gap-3">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF8EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#22A55A]">
                        <BadgeCheck size={12} />
                        Compte vérifié
                      </div>
                      <p className="mt-2 max-w-[14ch] text-[17px] font-black leading-[1.03] tracking-[-0.04em] text-[#0B2A5B]">
                        Niveau de confiance
                      </p>
                      <p className="mt-2 max-w-[24ch] text-[11px] leading-relaxed text-[#0B2A5B]/68">
                        Complétez votre profil pour renforcer votre crédibilité auprès de la communauté.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#0B2A5B]/8">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#FF6B00_0%,#FFB15A_45%,#22A55A_120%)]"
                          style={{ width: `${trustScore}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-[#F5F8FC] px-2.5 py-1 text-[10px] font-semibold text-[#0B2A5B]/72">
                          Email
                        </span>
                        <span className="rounded-full bg-[#F5F8FC] px-2.5 py-1 text-[10px] font-semibold text-[#0B2A5B]/72">
                          Téléphone
                        </span>
                        {!isFullyVerified ? (
                          <span className="rounded-full bg-[#FFF1E7] px-2.5 py-1 text-[10px] font-semibold text-[#FF6B00]">
                            À compléter
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0B2A5B] shadow-[0_12px_24px_rgba(0,0,0,0.10)]">
                      <ChevronRight size={16} />
                    </div>
                    <VerifiedHeroIllustration score={trustScore} />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  onParcelClick,
  onTripClick,
  onSelectUser,
  onSeeAllRecent,
  onSeeAllTransactions,
  onSelectAd,
  onNotificationClick,
  onMessagesClick,
  onVerifyClick,
  unreadCount = 0
}) => {
  // Données brutes des annonces, conservées via Firestore sans changer la logique métier existante.
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [userStats, setUserStats] = useState({ trips: 0, parcels: 0, delivered: 0 });
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    // Flux global des annonces, trié par création pour alimenter les sections premium.
    const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const adsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ad[];
        setAds(adsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching ads: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Statistiques personnelles pour l'utilisateur connecté et liste des annonces actives.
    const qUserAds = query(collection(db, 'ads'), where('userId', '==', currentUser.uid));
    const unsubscribeUserAds = onSnapshot(qUserAds, (snapshot) => {
      let trips = 0;
      let parcels = 0;
      let delivered = 0;
      const active: Ad[] = [];

      snapshot.forEach((doc) => {
        const ad = doc.data() as Ad;
        if (ad.type === 'voyage') trips++;
        if (ad.type === 'colis') parcels++;
        if (ad.status === 'COMPLETED') delivered++;

        if (ad.status !== 'COMPLETED' && ad.status !== 'EXPIRED') {
          active.push({ ...ad, id: doc.id });
        }
      });

      setUserStats({ trips, parcels, delivered });
      setActiveAds(
        active
          .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 6)
      );
    });

    return () => unsubscribeUserAds();
  }, [currentUser]);

  useEffect(() => {
    // Le carrousel du haut avance automatiquement pour éviter toute interaction manuelle.
    const timer = window.setInterval(() => {
      setBannerIndex((value) => (value + 1) % 3);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  // Sous-ensembles réutilisables pour les rails horizontaux.
  const availableTrips = useMemo(
    () => ads.filter((ad) => ad.type === 'voyage' && ad.status !== 'EXPIRED' && ad.status !== 'COMPLETED').slice(0, 8),
    [ads]
  );

  const availableParcels = useMemo(
    () => ads.filter((ad) => ad.type === 'colis' && ad.status !== 'EXPIRED' && ad.status !== 'COMPLETED').slice(0, 8),
    [ads]
  );

  const firstName = currentUser?.name?.split(' ')[0] || 'Invité';
  const avatarInitials = currentUser?.initials || 'ZE';

  // Score de complétion réaliste: on ne promet 100% que si le profil est vraiment complet et vérifié.
  const profileCompletion = useMemo(() => {
    const checks = [
      { key: 'email', label: 'Email', done: Boolean(currentUser?.email) },
      { key: 'phone', label: 'Téléphone', done: Boolean(currentUser?.phone) },
      { key: 'photo', label: 'Photo', done: Boolean(currentUser?.photoURL) },
      { key: 'verified', label: 'Identité', done: Boolean(currentUser?.isVerified) },
      { key: 'city', label: 'Ville', done: Boolean(currentUser?.city) },
      { key: 'bio', label: 'Bio', done: Boolean(currentUser?.bio) }
    ];

    const total = checks.length;
    const done = checks.filter((item) => item.done).length;
    const score = Math.round((done / total) * 100);

    return {
      score,
      checks
    };
  }, [currentUser]);

  const trustScore = profileCompletion.score;
  const isFullyVerified = trustScore === 100;
  const completedChecks = profileCompletion.checks.filter((item) => item.done).slice(0, 3);

  // Formats compacts pour les cartes horizontales.
  const getAdStatusLabel = (ad: Ad) => {
    if (ad.status === 'COMPLETED') return 'Livré';
    if (ad.status === 'EXPIRED') return 'Expiré';
    return ad.type === 'voyage' ? 'En cours' : 'À livrer';
  };

  const renderAvatar = (ad: Ad, sizeClassName = 'h-12 w-12') => {
    if (ad.userPhotoURL) {
      return (
        <img
          src={ad.userPhotoURL}
          alt={ad.userName}
          className={`${sizeClassName} rounded-full object-cover ring-2 ring-white shadow-[0_8px_20px_rgba(0,0,0,0.08)]`}
        />
      );
    }

    return (
      <div
        className={`${sizeClassName} flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FF6B00_0%,#FFB36A_45%,#0B2A5B_120%)] text-sm font-black text-white ring-2 ring-white shadow-[0_8px_20px_rgba(0,0,0,0.08)]`}
      >
        {ad.userInitials}
      </div>
    );
  };

  const heroVisuals = {
    trip: 'https://images.pexels.com/photos/31387532/pexels-photo-31387532.jpeg?auto=compress&cs=tinysrgb&w=1200',
    parcel: 'https://images.pexels.com/photos/17631317/pexels-photo-17631317.jpeg?auto=compress&cs=tinysrgb&w=1200',
    secure: 'https://images.pexels.com/photos/9547672/pexels-photo-9547672.jpeg?auto=compress&cs=tinysrgb&w=1200'
  } as const;

  const getRailVisual = (ad: Ad, index: number, kind: 'transaction' | 'trip' | 'parcel') => {
    if (ad.mediaURL) return ad.mediaURL;

    if (kind === 'transaction') {
      return ad.type === 'voyage'
        ? heroVisuals.trip
        : heroVisuals.parcel;
    }

    const visualPool = kind === 'trip'
      ? [heroVisuals.trip, heroVisuals.secure, heroVisuals.trip]
      : [heroVisuals.parcel, heroVisuals.secure, heroVisuals.parcel];

    return visualPool[index % visualPool.length];
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,107,0,0.06),transparent_20%),radial-gradient(circle_at_top_right,_rgba(11,42,91,0.06),transparent_24%),linear-gradient(180deg,#FFFDFC_0%,#FAF7F2_100%)] pb-28">
      <div className="mx-auto max-w-[560px] px-5 pb-6 pt-5">
        <HomeHeroSection
          currentUser={currentUser}
          avatarInitials={avatarInitials}
          firstName={firstName}
          onVerifyClick={onVerifyClick}
          onMessagesClick={onMessagesClick}
          onNotificationClick={onNotificationClick}
          unreadCount={unreadCount}
          bannerIndex={bannerIndex}
          trustScore={trustScore}
          isFullyVerified={isFullyVerified}
          completedChecks={completedChecks}
        />

        {/* Actions principales en 2 cartes, proches de la maquette de référence. */}
        <section className="mt-4 grid grid-cols-2 gap-3">
          <ActionCard
            title="Envoyer"
            subtitle="un colis"
            icon={<Package size={24} />}
            className="bg-[linear-gradient(135deg,#FF8A19_0%,#FF6B00_100%)]"
            onClick={onParcelClick}
          />
          <ActionCard
            title="Proposer"
            subtitle="un voyage"
            icon={<Plane size={24} className="rotate-45" />}
            className="bg-[linear-gradient(135deg,#122B62_0%,#0B2A5B_100%)]"
            onClick={onTripClick}
          />
        </section>

        {/* Résumé rapide des volumes pour garder un lien direct avec les données réelles. */}
        <section className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-[18px] bg-white px-3 py-3 text-center shadow-[0_10px_24px_rgba(29,29,75,0.07)] ring-1 ring-black/5">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EAF8EE] text-[#22A55A]">
              <Plane size={16} />
            </div>
            <p className="mt-2 text-lg font-black text-[#0B2A5B]">{userStats.trips}</p>
            <p className="text-[10px] font-semibold text-[#0B2A5B]/54">Voyages</p>
          </div>

          <div className="rounded-[18px] bg-white px-3 py-3 text-center shadow-[0_10px_24px_rgba(29,29,75,0.07)] ring-1 ring-black/5">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FFF0E5] text-[#FF6B00]">
              <Package size={16} />
            </div>
            <p className="mt-2 text-lg font-black text-[#0B2A5B]">{userStats.parcels}</p>
            <p className="text-[10px] font-semibold text-[#0B2A5B]/54">Colis</p>
          </div>

          <div className="rounded-[18px] bg-white px-3 py-3 text-center shadow-[0_10px_24px_rgba(29,29,75,0.07)] ring-1 ring-black/5">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B2A5B]">
              <Truck size={16} />
            </div>
            <p className="mt-2 text-lg font-black text-[#0B2A5B]">{userStats.delivered}</p>
            <p className="text-[10px] font-semibold text-[#0B2A5B]/54">Livrés</p>
          </div>
        </section>

        {/* Transactions en cours, converties en rail horizontal compact. */}
        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-[#0B2A5B]">Mes transactions en cours</h2>
            </div>
            <button
              type="button"
              onClick={onSeeAllTransactions}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF6B00]"
            >
              Voir tout <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory">
            {(activeAds.length > 0 ? activeAds : ads.filter((ad) => ad.status !== 'EXPIRED').slice(0, 4)).map((ad, index) => (
              <RailCard
                key={ad.id}
                className="min-w-[248px]"
                visualUrl={getRailVisual(ad, index, 'transaction')}
                visualLabel={ad.type === 'voyage' ? 'Voyage' : 'Colis'}
                onClick={() => onSelectAd(ad)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${ad.type === 'voyage' ? 'bg-[#EEF4FF] text-[#0B2A5B]' : 'bg-[#FFF0E5] text-[#FF6B00]'}`}>
                    {ad.type === 'voyage' ? 'Voyage' : 'Colis'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0B2A5B]/45">
                    <Clock3 size={12} />
                    {getAdStatusLabel(ad)}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B2A5B]/6 text-[#0B2A5B]">
                    {ad.type === 'voyage' ? <Plane size={19} /> : <Package size={19} />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#0B2A5B]">{ad.origin} → {ad.destination}</p>
                    <p className="mt-1 text-xs font-medium text-[#0B2A5B]/55">{ad.date}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                  <div className="flex items-center gap-1.5 text-[#0B2A5B]/45">
                    <Eye size={13} />
                    <span className="text-[10px] font-bold">{ad.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#0B2A5B]/45">
                    <span className="text-[10px] font-bold">{ad.likes?.length || 0} likes</span>
                  </div>
                </div>
              </RailCard>
            ))}
          </div>
        </section>

        {/* Voyages disponibles avec cartes premium et avatars réels si présents. */}
        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-black text-[#0B2A5B]">Voyages disponibles</h2>
            <button
              type="button"
              onClick={onSeeAllRecent}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF6B00]"
            >
              Voir tout <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory">
            {loading ? (
              <div className="rounded-[24px] bg-white px-4 py-6 text-sm font-medium text-[#0B2A5B]/45 shadow-[0_14px_36px_rgba(29,29,75,0.08)]">
                Chargement des voyages...
              </div>
            ) : availableTrips.length === 0 ? (
              <div className="rounded-[24px] bg-white px-4 py-6 text-sm font-medium text-[#0B2A5B]/45 shadow-[0_14px_36px_rgba(29,29,75,0.08)]">
                Aucun voyage disponible pour le moment.
              </div>
            ) : availableTrips.map((ad) => {
              const isVerified = Boolean(ad.userVerified || ad.userRating >= 4.8);

              return (
                <RailCard
                  key={ad.id}
                  className="min-w-[256px]"
                  onClick={() => onSelectAd(ad)}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectUser({
                          name: ad.userName,
                          initials: ad.userInitials,
                          rating: ad.userRating,
                          uid: ad.userId
                        });
                      }}
                      className="shrink-0"
                    >
                      {renderAvatar(ad, 'h-12 w-12')}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectUser({
                          name: ad.userName,
                          initials: ad.userInitials,
                          rating: ad.userRating,
                          uid: ad.userId
                        });
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-black text-[#0B2A5B]">{ad.userName}</p>
                        {isVerified ? <BadgeCheck size={14} className="text-[#22A55A]" /> : null}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[#FF6B00]">
                        <Star size={12} className="fill-[#FFB300] text-[#FFB300]" />
                        <span className="text-xs font-bold text-[#0B2A5B]">{ad.userRating.toFixed(1)}</span>
                      </div>
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#0B2A5B]">
                      <MapPin size={14} className="text-[#FF6B00]" />
                      <span className="truncate">{ad.origin} → {ad.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#0B2A5B]/60">
                      <CalendarDays size={14} />
                      <span>{ad.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#0B2A5B]/60">
                      <Truck size={14} />
                      <span>{ad.weight || '25 kg'} disponibles</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[linear-gradient(180deg,#FFF1E1_0%,#FFE9D4_100%)] px-3 py-2 text-center text-sm font-bold text-[#FF6B00]">
                    {ad.price ? `${ad.price} €` : 'Voir détails'}
                  </div>
                </RailCard>
              );
            })}
          </div>
        </section>

        {/* Colis disponibles, construits sur le même système de carte premium. */}
        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-black text-[#0B2A5B]">Colis disponibles</h2>
            <button
              type="button"
              onClick={onSeeAllRecent}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF6B00]"
            >
              Voir tout <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory">
            {availableParcels.length === 0 ? (
              <div className="rounded-[24px] bg-white px-4 py-6 text-sm font-medium text-[#0B2A5B]/45 shadow-[0_14px_36px_rgba(29,29,75,0.08)]">
                Aucun colis disponible pour le moment.
              </div>
            ) : availableParcels.map((ad, index) => (
              <RailCard
                key={ad.id}
                className="min-w-[256px]"
                visualUrl={getRailVisual(ad, index, 'parcel')}
                visualLabel="Colis"
                onClick={() => onSelectAd(ad)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFF2E6_0%,#F8FAFF_100%)] ring-1 ring-black/5">
                    {ad.mediaURL ? (
                      <img src={ad.mediaURL} alt={ad.userName} className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      <Package size={24} className="text-[#FF6B00]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#0B2A5B]">{ad.category || ad.description || 'Colis'}</p>
                        <p className="mt-1 text-xs text-[#0B2A5B]/55">{ad.weight || '1 kg'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#FF6B00]">{ad.price ? `${ad.price} €` : '—'}</p>
                        <p className="text-[11px] font-medium text-[#0B2A5B]/45">Prix</p>
                      </div>
                    </div>

                    <p className="mt-2 truncate text-xs font-medium text-[#0B2A5B]/58">Par {ad.userName}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#0B2A5B]/60">
                      <MapPin size={13} className="text-[#0B2A5B]/40" />
                      <span className="truncate">{ad.origin} → {ad.destination}</span>
                    </div>
                  </div>
                </div>
              </RailCard>
            ))}
          </div>
        </section>

        {/* Bandeau sécurité final pour rappeler le paiement protégé, comme dans la référence. */}
        <section className="mt-7">
          <div className="rounded-[28px] bg-[linear-gradient(180deg,#FFF4E8_0%,#FFF8F2_100%)] p-4 shadow-[0_18px_40px_rgba(11,42,91,0.08)] ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#FF6B00] text-white shadow-[0_12px_24px_rgba(255,107,0,0.24)]">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#0B2A5B]">Paiement 100% sécurisé</p>
                  <p className="mt-1 max-w-[22ch] text-sm leading-relaxed text-[#0B2A5B]/64">
                    Votre argent est bloqué et libéré uniquement après confirmation.
                  </p>
                </div>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#0B2A5B] text-white shadow-[0_14px_30px_rgba(11,42,91,0.18)]">
                <Lock size={24} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeView;
