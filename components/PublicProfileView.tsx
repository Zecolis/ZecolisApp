import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Heart, Eye, Plane, X } from 'lucide-react';
import { Ad, User } from '../types';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface PublicProfileViewProps {
  user: { name: string; initials: string; rating: number; uid?: string }; // Added uid to passed user object if available, or we might need to search by name?? Ideally we pass UID. 
  // Wait, in HomeView we pass a constructed object. We should pass the full User object or at least UID.
  // The current App.tsx passes `selectedUser` which comes from `handleSelectUser`.
  // `handleSelectUser` in App.tsx takes `{ name: string, initials: string, rating: number }`.
  // I need to update App.tsx to pass the full user or uid if possible. 
  // Let's assume for now we might not have UID if we just click on a name string. 
  // BUT, in HomeView, we click on `ad.userName`. We don't have userID there? 
  // We need to check Ad interface. Ad has `userId`? Yes.
  // So we should pass userId to `onSelectUser`.

  // Refactoring plan: 
  // 1. Update PublicProfileView to accept `userId` or full `User` object.
  // 2. But `App.tsx` state `selectedUser` is just name/initials/rating. 
  // I will update this file to accept `userId` if possible, but for now I will try to find the user by name if no ID (risky). 
  // BETTER: Update App.tsx and HomeView/SearchView to pass the whole User object or userId.

  // Let's update the interface to accept userId.
  userId?: string;
  onBack: () => void;
  onSelectAd: (ad: Ad) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onContact: () => void;
}

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ user, userId, onBack, onSelectAd, favorites, toggleFavorite, onContact }) => {
  const [isPhotoEnlarged, setIsPhotoEnlarged] = useState(false);
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let currentUserId = userId;
        let userData = null;

        // If we have a userId, fetch user directly
        if (currentUserId) {
          const userDoc = await getDoc(doc(db, 'users', currentUserId));
          if (userDoc.exists()) {
            userData = { uid: userDoc.id, ...userDoc.data() } as User;
          }
        }
        // Fallback: This is not ideal, relying on passed props if no ID. 
        // But to properly implement "Public Profile" from an Ad, we should pass the ad.userId.

        if (userData) {
          setFullUser(userData);
        }

        // Fetch Ads
        // If we don't have userId, we can't fetch ads accurately. 
        // I will assume for now that we will fix the upstream to pass userId.
        if (currentUserId) {
          const q = query(collection(db, 'ads'), where('userId', '==', currentUserId));
          const querySnapshot = await getDocs(q);
          const ads: Ad[] = [];
          querySnapshot.forEach((doc) => {
            const ad = doc.data() as Ad;
            if (ad.status !== 'COMPLETED' && ad.status !== 'EXPIRED') {
              ads.push({ id: doc.id, ...ad });
            }
          });
          setActiveAds(ads);
        }

      } catch (error) {
        console.error("Error fetching public profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userId]);

  // Use fullUser if available, otherwise fall back to passed 'user' prop
  const displayUser = fullUser || { ...user, bio: "Ce membre n'a pas encore ajouté de biographie." };

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-5 flex items-center">
        <button onClick={onBack} className="p-2 text-black">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-[#1D1D4B] pr-8">
          Profil de {displayUser.name.split(' ')[0]}
        </h1>
      </header>

      {/* Profile Card */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-50 rounded-full"></div>

          {/* Avatar Section */}
          <button
            onClick={() => setIsPhotoEnlarged(true)}
            className="relative z-10 transition-transform active:scale-95"
          >
            <div className="w-28 h-28 bg-[#FFE082] rounded-full flex items-center justify-center text-[#1D1D4B] font-bold text-4xl border-4 border-white shadow-lg">
              {displayUser.initials}
            </div>
          </button>

          <h2 className="mt-6 text-2xl font-black text-[#1D1D4B]">{displayUser.name}</h2>

          <div className="flex items-center gap-4 mt-3">
            <div className="bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-orange-100">
              <Star size={14} className="fill-[#FFB300] text-[#FFB300]" />
              <span className="text-sm font-bold text-[#FFB300]">{displayUser.rating}</span>
            </div>
            <span className="text-gray-300 font-bold">•</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeAds.filter(a => a.type === 'voyage').length} VOYAGES</span>
          </div>

          <p className="mt-8 text-sm text-gray-400 font-medium italic leading-relaxed max-w-[220px]">
            {displayUser.bio || "Ce membre n'a pas encore ajouté de biographie."}
          </p>

          <div className="w-full h-[1px] bg-gray-50 my-8"></div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 w-full">
            <div className="flex flex-col items-center border-r border-gray-50">
              <span className="text-2xl font-black text-[#1D1D4B]">{activeAds.filter(a => a.type === 'voyage').length}</span>
              <span className="text-[10px] font-extrabold text-gray-300 uppercase tracking-widest mt-1">VOYAGES</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-[#1D1D4B]">0</span>
              <span className="text-[10px] font-extrabold text-gray-300 uppercase tracking-widest mt-1">AVIS</span>
            </div>
          </div>

          <button
            onClick={onContact}
            className="mt-8 w-full py-4 bg-[#1D1D4B] text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
          >
            Contacter
          </button>
        </div>
      </div>

      {/* Active Ads Section */}
      <div className="px-5 mt-10">
        <div className="flex items-center gap-2 mb-6 ml-2">
          <Plane size={20} className="text-[#FF5722]" />
          <h3 className="text-sm font-black text-[#1D1D4B] uppercase tracking-wider">
            ANNONCES ACTIVES ({activeAds.length})
          </h3>
        </div>

        {activeAds.length > 0 ? (
          <div className="space-y-4">
            {activeAds.map(ad => (
              <div
                key={ad.id}
                onClick={() => onSelectAd(ad)}
                className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm relative active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#FFE082] rounded-full flex items-center justify-center text-[#1D1D4B] font-bold text-xs">
                    {ad.userInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1D1D4B] text-sm">{ad.userName}</h4>
                    <div className="flex items-center gap-1">
                      <Star size={10} className="fill-[#FFB300] text-[#FFB300]" />
                      <span className="text-[10px] font-bold text-[#FFB300]">{ad.userRating}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(ad.id); }}
                    className="ml-auto p-2"
                  >
                    <Heart size={20} className={`${favorites.includes(ad.id) ? 'fill-[#FF5722] text-[#FF5722]' : 'text-gray-200'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-8 relative">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-300">Départ</span>
                    <span className="text-base font-black text-[#1D1D4B]">{ad.origin}</span>
                  </div>

                  <div className="flex-1 px-4 relative flex items-center justify-center">
                    <div className="w-full h-[1px] bg-gray-100"></div>
                    <Plane size={12} className={`text-[#FF5722] absolute bg-white px-1 ${ad.type === 'voyage' ? 'rotate-45' : ''}`} />
                    <span className="absolute -bottom-6 text-[10px] font-bold text-indigo-900">{ad.date}</span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-300">Arrivée</span>
                    <span className="text-base font-black text-[#1D1D4B]">{ad.destination}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-400">
                      Dispo: {ad.weight}
                    </div>
                    <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-[10px] font-black text-[#1D1D4B]">
                      <span className="text-indigo-900">{ad.price}€</span><span className="text-gray-400 font-bold">/kg</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-900">
                    <Eye size={16} />
                    <span className="text-[10px] font-black">{ad.views || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm font-medium">
            Aucune annonce active pour le moment.
          </div>
        )}
      </div>

      {/* Photo Enlargement Modal */}
      {isPhotoEnlarged && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 backdrop-blur-md bg-opacity-95">
          <button
            onClick={() => setIsPhotoEnlarged(false)}
            className="absolute top-10 right-10 text-white p-2"
          >
            <X size={32} />
          </button>
          <div className="w-full max-w-[340px] aspect-square bg-[#FFE082] rounded-[60px] flex items-center justify-center text-[#1D1D4B] font-black text-8xl shadow-2xl border-8 border-white/10 animate-in fade-in zoom-in duration-300">
            {displayUser.initials}
          </div>
          <p className="mt-10 text-white text-xl font-black">{displayUser.name}</p>
        </div>
      )}
    </div>
  );
};

export default PublicProfileView;
