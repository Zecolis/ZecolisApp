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

interface HomeViewProps {
  currentUser: User | null;
  onParcelClick?: () => void;
  onTripClick?: () => void;
  onSelectUser: (user: { name: string, initials: string, rating: number, uid?: string }) => void;
  onSeeAllRecent: () => void;
  onSeeAllTransactions: () => void;
  onSelectAd: (ad: Ad) => void;
  onNotificationClick: () => void;
  onMessagesClick?: () => void;
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
  children: React.ReactNode;
}> = ({ className = '', onClick, children }) => (
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
    className={`snap-start rounded-[24px] bg-white p-4 text-left shadow-[0_14px_36px_rgba(29,29,75,0.08)] ring-1 ring-black/5 active:scale-[0.99] ${className}`}
  >
    {children}
  </div>
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
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.82)_100%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,107,0,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(11,42,91,0.08),transparent_28%)]" />

    <div className="relative z-10 flex min-h-[340px] flex-col gap-4 px-4 pb-4 pt-4 sm:min-h-[360px] sm:px-5">
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

      {/* Carrousel automatique: cartes plus compactes et translucides, sans surcharger le hero. */}
      <div className="flex-1">
        <div className="overflow-hidden rounded-[28px]">
          <div
            className="flex w-[200%] transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${bannerIndex * 50}%)` }}
          >
            <div className="w-1/2 pr-2">
              <button
                type="button"
                onClick={onVerifyClick}
                className="flex h-full w-full flex-col justify-between rounded-[26px] bg-white/92 p-4 text-left shadow-[0_16px_34px_rgba(11,42,91,0.10)] ring-1 ring-white/75 backdrop-blur-md active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF8EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#22A55A]">
                      <BadgeCheck size={12} />
                      Compte vérifié
                    </div>
                    <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B2A5B]/46">
                      Niveau de confiance
                    </p>
                    <p className="mt-1 text-[34px] font-black leading-none tracking-[-0.06em] text-[#0B2A5B]">
                      {trustScore}%
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,rgba(255,107,0,0.16)_0%,rgba(34,165,90,0.12)_100%)] text-[#22A55A] shadow-[0_12px_24px_rgba(11,42,91,0.08)]">
                    <ShieldCheck size={24} />
                  </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#0B2A5B]/8">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#FF6B00_0%,#FFB15A_45%,#22A55A_120%)]"
                    style={{ width: `${trustScore}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {completedChecks.slice(0, 3).map((item) => (
                    <span
                      key={item.key}
                      className="rounded-full bg-[#F5F8FC] px-3 py-1 text-[10px] font-semibold text-[#0B2A5B]/72"
                    >
                      {item.label}
                    </span>
                  ))}
                  {!isFullyVerified ? (
                    <span className="rounded-full bg-[#FFF1E7] px-3 py-1 text-[10px] font-semibold text-[#FF6B00]">
                      À compléter
                    </span>
                  ) : null}
                </div>
              </button>
            </div>

            <div className="w-1/2 pl-2">
              <button
                type="button"
                className="flex h-full w-full flex-col justify-between rounded-[26px] bg-[linear-gradient(135deg,rgba(11,42,91,0.98)_0%,rgba(11,42,91,0.90)_100%)] p-4 text-left shadow-[0_16px_34px_rgba(11,42,91,0.16)] ring-1 ring-white/10 backdrop-blur-md active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/88">
                      <Lock size={12} />
                      Compte sécurisé
                    </div>
                    <p className="mt-3 max-w-[18ch] text-[16px] font-black leading-[1.02] tracking-[-0.03em] text-white">
                      Protection active pour vos échanges
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0B2A5B] shadow-[0_12px_24px_rgba(0,0,0,0.10)]">
                    <ChevronRight size={16} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-semibold text-white/86">
                    Paiement sûr
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-semibold text-white/86">
                    Données protégées
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          {[0, 1].map((dot) => (
            <span
              key={dot}
              className={`h-1.5 rounded-full transition-all duration-300 ${dot === bannerIndex ? 'w-7 bg-[#FF6B00]' : 'w-3 bg-[#0B2A5B]/12'}`}
            />
          ))}
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
          active.push({ id: doc.id, ...ad });
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
      setBannerIndex((value) => (value + 1) % 2);
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,107,0,0.06),transparent_20%),radial-gradient(circle_at_top_right,_rgba(11,42,91,0.06),transparent_24%),linear-gradient(180deg,#FFFDFC_0%,#FAF7F2_100%)] pb-28">
      <div className="mx-auto max-w-[560px] px-5 pb-6 pt-5">
        {/* Hero premium du haut: l'image reste décorative derrière les infos utiles. */}
        <section className="relative overflow-hidden rounded-[34px] shadow-[0_22px_60px_rgba(11,42,91,0.10)] ring-1 ring-black/5">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${headerHeroImage})`,
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.82)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,107,0,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(11,42,91,0.08),transparent_28%)]" />
          <div className="relative z-10 flex min-h-[340px] flex-col gap-4 px-4 pb-4 pt-4 sm:min-h-[360px] sm:px-5">
        {/* Header premium inspiré de la référence: avatar, nom, pays et actions à droite. */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onVerifyClick}
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95 shadow-[0_14px_30px_rgba(11,42,91,0.10)] ring-1 ring-white/70 backdrop-blur-md active:scale-95"
            >
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-base font-black text-[#0B2A5B]">{avatarInitials}</span>
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#0B2A5B]/56">
                <span>Bonjour, 👋</span>
                <span className="truncate font-semibold text-[#0B2A5B]">{firstName}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-black tracking-[-0.02em] text-[#0B2A5B]">
                  {currentUser?.name || 'Utilisateur'}
                </p>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${isFullyVerified ? 'bg-[#EAF8EE] text-[#22A55A]' : 'bg-[#FFF3E6] text-[#FF6B00]'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isFullyVerified ? 'bg-[#22A55A]' : 'bg-[#FF6B00]'}`} />
                  {isFullyVerified ? 'Compte vérifié' : 'Compte à compléter'}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-2 text-xs font-medium text-[#0B2A5B]/58">
                <span>🇫🇷 France</span>
                <span className="text-[#0B2A5B]/28">↔</span>
                <span>🇧🇯 Bénin</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMessagesClick}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/92 shadow-[0_14px_30px_rgba(11,42,91,0.10)] ring-1 ring-white/70 backdrop-blur-md active:scale-95"
            >
              <MessageSquare size={18} className="text-[#0B2A5B]" />
            </button>
            <button
              type="button"
              onClick={onNotificationClick}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/92 shadow-[0_14px_30px_rgba(11,42,91,0.10)] ring-1 ring-white/70 backdrop-blur-md active:scale-95"
            >
              <Bell size={18} className="text-[#0B2A5B]" />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] font-bold text-white shadow-[0_10px_20px_rgba(255,107,0,0.32)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </button>
          </div>
        </header>

        {/* Carousel des bannières en scroll horizontal, proche de la référence fournie. */}
        <section className="mt-4">
          <div className="overflow-hidden rounded-[26px]">
            <div
              className="flex w-[200%] transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${bannerIndex * 50}%)` }}
            >
              <div className="w-1/2 pr-2">
                <button
                  type="button"
                  onClick={onVerifyClick}
                  className="w-full rounded-[22px] bg-white/92 p-3.5 text-left shadow-[0_12px_28px_rgba(11,42,91,0.08)] ring-1 ring-white/75 backdrop-blur-md active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#FF6B00]/12 text-[#FF6B00]">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-[#0B2A5B]">Compte vérifié</span>
                          <BadgeCheck size={13} className="text-[#22A55A]" />
                        </div>
                        <p className="mt-0.5 text-[11px] text-[#0B2A5B]/58">
                          Niveau de confiance: {trustScore}%
                        </p>
                      </div>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#FF6B00]/12 bg-white">
                      <span className="text-[11px] font-black text-[#22A55A]">{trustScore}%</span>
                    </div>
                  </div>

                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#0B2A5B]/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#FF6B00_0%,#FFB15A_45%,#22A55A_120%)]"
                      style={{ width: `${trustScore}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {completedChecks.map((item) => (
                      <span
                        key={item.key}
                        className="rounded-full bg-[#EAF8EE] px-2.5 py-1 text-[10px] font-semibold text-[#22A55A]"
                      >
                        {item.label}
                      </span>
                    ))}
                    {!isFullyVerified ? (
                      <span className="rounded-full bg-[#FFF0E5] px-2.5 py-1 text-[10px] font-semibold text-[#FF6B00]">
                        À compléter
                      </span>
                    ) : null}
                  </div>
                </button>
              </div>

              <div className="w-1/2 pl-2">
                <button
                  type="button"
                  className="w-full rounded-[22px] bg-[linear-gradient(135deg,rgba(11,42,91,0.98)_0%,rgba(11,42,91,0.90)_100%)] p-3.5 text-left shadow-[0_12px_28px_rgba(11,42,91,0.14)] ring-1 ring-white/10 backdrop-blur-md active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white/10 text-white">
                        <Lock size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white">Compte sécurisé</p>
                        <p className="mt-0.5 text-[11px] text-white/70">
                          Protection active des échanges
                        </p>
                      </div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0B2A5B]">
                      <ChevronRight size={15} />
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-white/72">
                    <span className="rounded-full bg-white/10 px-2 py-1">Paiement sûr</span>
                    <span className="rounded-full bg-white/10 px-2 py-1">Données protégées</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-2">
            {[0, 1].map((dot) => (
              <span
                key={dot}
                className={`h-1.5 rounded-full transition-all duration-300 ${dot === bannerIndex ? 'w-7 bg-[#FF6B00]' : 'w-3 bg-[#0B2A5B]/12'}`}
              />
            ))}
          </div>
        </section>

          </div>
        </section>

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
            {(activeAds.length > 0 ? activeAds : ads.filter((ad) => ad.status !== 'EXPIRED').slice(0, 4)).map((ad) => (
              <RailCard
                key={ad.id}
                className="min-w-[232px]"
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
                  className="min-w-[246px]"
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
            ) : availableParcels.map((ad) => (
              <RailCard
                key={ad.id}
                className="min-w-[232px]"
                onClick={() => onSelectAd(ad)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#FFF2E6_0%,#F8FAFF_100%)] ring-1 ring-black/5">
                    {ad.mediaURL ? (
                      <img src={ad.mediaURL} alt={ad.userName} className="h-full w-full object-cover" />
                    ) : (
                      <Package size={28} className="text-[#FF6B00]" />
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
