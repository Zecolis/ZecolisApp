import React, { useState, useEffect } from 'react';
import { Bell, Package, Plane, Map, CheckCircle, Heart, Star, Eye } from 'lucide-react';
import { Ad, User } from '../types';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';

interface HomeViewProps {
  currentUser: User | null;
  onParcelClick?: () => void;
  onTripClick?: () => void;
  onSelectUser: (user: { name: string, initials: string, rating: number, uid?: string }) => void;
  onSeeAllRecent: () => void;
  onSeeAllTransactions: () => void;
  onSelectAd: (ad: Ad) => void;
  onNotificationClick: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ currentUser, onParcelClick, onTripClick, onSelectUser, onSeeAllRecent, onSeeAllTransactions, onSelectAd, onNotificationClick }) => {
  // ... (maintain existing state) ...
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [userStats, setUserStats] = useState({ trips: 0, parcels: 0, delivered: 0 });

  useEffect(() => {
    const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ad[];
      setAds(adsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching ads: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const qUserAds = query(collection(db, 'ads'), where('userId', '==', currentUser.uid));
    const unsubscribeUserAds = onSnapshot(qUserAds, (snapshot) => {
      let trips = 0;
      let parcels = 0;
      let delivered = 0;
      const active: Ad[] = [];

      snapshot.forEach(doc => {
        const ad = doc.data() as Ad;
        if (ad.type === 'voyage') trips++;
        if (ad.type === 'colis') parcels++;
        if (ad.status === 'COMPLETED') delivered++;

        if (ad.status !== 'COMPLETED' && ad.status !== 'EXPIRED') {
          active.push({ id: doc.id, ...ad });
        }
      });

      setUserStats({ trips, parcels, delivered });
      setActiveAds(active.sort((a, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 3));
    });

    return () => unsubscribeUserAds();
  }, [currentUser]);

  return (
    <div className="px-5 py-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Bienvenue,</h2>
          <h1 className="text-xl font-bold text-[#1D1D4B]">
            {currentUser ? currentUser.name.split(' ')[0] : 'Invité'} !
          </h1>
        </div>
        <button
          className="p-2 text-[#1D1D4B]"
          onClick={onNotificationClick}
        >
          <div className="relative">
            <Bell size={24} />
            <span className="absolute top-0 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          onClick={onParcelClick}
          className="bg-[#22C55E] p-5 rounded-xl text-white flex flex-col gap-3 shadow-[0_8px_30px_rgb(34,197,94,0.3)] active:scale-95 transition-transform cursor-pointer"
        >
          <div className="bg-white/20 w-9 h-9 rounded-lg flex items-center justify-center">
            <Package size={20} />
          </div>
          <span className="text-base font-bold leading-tight">Envoyer<br />un colis</span>
        </div>
        <div
          onClick={onTripClick}
          className="bg-[#FF5722] p-5 rounded-xl text-white flex flex-col gap-3 shadow-[0_8px_30px_rgb(255,87,34,0.3)] active:scale-95 transition-transform cursor-pointer"
        >
          <div className="bg-white/20 w-9 h-9 rounded-lg flex items-center justify-center">
            <Plane size={20} className="rotate-45" />
          </div>
          <span className="text-base font-bold leading-tight">Proposer<br />un voyage</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <Map size={18} className="text-[#1D1D4B] mb-1" />
          <span className="text-lg font-bold text-[#1D1D4B]">{userStats.trips}</span>
          <span className="text-[9px] font-semibold text-gray-400">Voyages</span>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <Package size={18} className="text-[#FF5722] mb-1" />
          <span className="text-lg font-bold text-[#1D1D4B]">{userStats.parcels}</span>
          <span className="text-[9px] font-semibold text-gray-400">Offres</span>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <CheckCircle size={18} className="text-[#22C55E] mb-1" />
          <span className="text-lg font-bold text-[#1D1D4B]">{userStats.delivered}</span>
          <span className="text-[9px] font-semibold text-gray-400">Livrés</span>
        </div>
      </div>

      {/* Transactions en cours */}
      {activeAds.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-[#1D1D4B]">Transactions en cours</h3>
            <button onClick={onSeeAllTransactions} className="text-xs font-bold text-[#FF5722]">Voir tout</button>
          </div>
          <div className="space-y-3">
            {activeAds.map(ad => (
              <div
                key={ad.id}
                onClick={() => onSelectAd(ad)}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] relative active:scale-95 transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ad.type === 'voyage' ? 'bg-orange-50 text-[#FF5722]' : 'bg-green-50 text-[#22C55E]'}`}>
                    {ad.type === 'voyage' ? 'Voyage' : 'Colis'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{ad.date}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-[#1D1D4B]">{ad.origin}</span>
                  <div className="flex-1 px-2 relative flex items-center justify-center">
                    <div className="w-full h-[1px] bg-gray-100"></div>
                    {ad.type === 'voyage' ? <Plane size={12} className="text-gray-300 rotate-45 absolute bg-white px-0.5" /> : <Package size={12} className="text-gray-300 absolute bg-white px-0.5" />}
                  </div>
                  <span className="text-sm font-bold text-[#1D1D4B]">{ad.destination}</span>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-50 pt-2">
                  <div className="flex items-center gap-1 text-gray-300">
                    <Eye size={12} strokeWidth={2.5} />
                    <span className="text-[9px] font-bold">{ad.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-300">
                    <Heart size={12} className={ad.likes?.includes(currentUser?.uid || '') ? 'fill-[#FF5722] text-[#FF5722]' : ''} strokeWidth={2.5} />
                    <span className="text-[9px] font-bold">{ad.likes?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-[#1D1D4B]">Annonces récentes</h3>
          <button onClick={onSeeAllRecent} className="text-xs font-bold text-[#FF5722]">Voir tout</button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-400 text-sm text-center">Chargement des annonces...</p>
          ) : ads.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">Aucune annonce pour le moment.</p>
          ) : (
            ads.map(ad => (
              <div
                key={ad.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] relative active:scale-[0.98] transition-all cursor-pointer group"
                onClick={() => onSelectAd(ad)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="flex items-center gap-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectUser({ name: ad.userName, initials: ad.userInitials, rating: ad.userRating, uid: ad.userId });
                    }}
                  >
                    <div className="w-10 h-10 bg-[#FFE082] rounded-full flex items-center justify-center text-[#1D1D4B] font-bold text-xs border border-white shadow-sm group-active:scale-95 transition-transform">
                      {ad.userInitials}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1D1D4B] text-sm group-hover:underline">{ad.userName}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={10} className="fill-[#FFB300] text-[#FFB300]" />
                        <span className="text-[10px] font-bold text-[#FFB300]">{ad.userRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-300">
                      <Eye size={14} strokeWidth={2.5} />
                      <span className="text-[10px] font-bold">{ad.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <Heart size={14} className={ad.likes?.includes(currentUser?.uid || '') ? 'fill-[#FF5722] text-[#FF5722]' : ''} strokeWidth={2.5} />
                      <span className="text-[10px] font-bold">{ad.likes?.length || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-gray-300 uppercase block">Départ</span>
                    <span className="text-base font-bold text-[#1D1D4B]">{ad.origin}</span>
                  </div>
                  <div className="flex-1 px-4 relative flex items-center justify-center">
                    <div className="w-full h-[1px] bg-gray-100"></div>
                    <Plane size={14} className="text-[#FF5722] rotate-45 absolute bg-white px-0.5" />
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-gray-300 uppercase block">Arrivée</span>
                    <span className="text-base font-bold text-[#1D1D4B]">{ad.destination}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
