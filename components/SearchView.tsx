
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Plane, Package, Star, Heart, SlidersHorizontal, ChevronRight, Calendar, Map, X, ArrowUpDown, Scale, Euro, LayoutGrid, Eye } from 'lucide-react';
import { Ad } from '../types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface SearchViewProps {
  initialCriteria?: any;
  onSelectAd: (ad: Ad) => void;
  onSelectUser: (user: { name: string, initials: string, rating: number, uid?: string }) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ initialCriteria, onSelectAd, onSelectUser, favorites, toggleFavorite }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  // États des filtres (déplacés dans la popup)
  const [origin, setOrigin] = useState(initialCriteria?.origin || '');
  const [destination, setDestination] = useState(initialCriteria?.destination || '');
  const [departureDate, setDepartureDate] = useState(initialCriteria?.date || '');
  const [arrivalDate, setArrivalDate] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [maxWeight, setMaxWeight] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<'all' | 'voyages' | 'colis'>('all');

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

  const filteredAds = ads.filter(ad => {
    const queryStr = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      ad.origin.toLowerCase().includes(queryStr) ||
      ad.destination.toLowerCase().includes(queryStr) ||
      ad.userName.toLowerCase().includes(queryStr) ||
      (ad.type && ad.type.toLowerCase().includes(queryStr)) ||
      (ad.description && ad.description.toLowerCase().includes(queryStr));

    const matchesOrigin = !origin || ad.origin.toLowerCase().includes(origin.toLowerCase());
    const matchesDest = !destination || ad.destination.toLowerCase().includes(destination.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'voyages' && ad.type === 'voyage') || (activeTab === 'colis' && ad.type === 'colis');
    // Price filtering might be tricky if price is not number or undefined.
    const price = typeof ad.price === 'number' ? ad.price : parseFloat(ad.price || '0');
    const matchesPrice = !maxPrice || price <= maxPrice;

    // Weight filtering
    const weightVal = ad.weight ? parseInt(ad.weight.toString().split(' ')[0]) : 0;
    const matchesWeight = !maxWeight || weightVal <= maxWeight;

    // Date filtering (simple string match for now as dates are strings "JJ/MM/AAAA")
    // If departureDate set, verify if ad date includes it? 
    // Format inconsistency: ad.date might be "18 févr" or "18/02/2026".
    // For now skip date strict check or do partial.

    return matchesSearch && matchesOrigin && matchesDest && matchesTab && matchesPrice && matchesWeight;
  });

  const DateInputField = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-400 ml-1">{label}</label>
      <div className="bg-gray-50 rounded-xl px-3 py-3 flex items-center justify-between">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="JJ/MM/AAAA"
          className="bg-transparent text-xs font-bold text-black focus:outline-none w-full"
        />
        <div className="relative ml-2">
          <Calendar size={14} className="text-gray-300" />
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
            onChange={(e) => {
              const date = new Date(e.target.value);
              if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                onChange(`${day}/${month}/${year}`);
              }
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-5 py-6 bg-gray-50 min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Rechercher</h1>
      </div>

      {/* Barre de recherche simplifiée */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl flex items-center px-4 py-3.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#1D1D4B]/10">
          <SearchIcon size={20} className="text-gray-300 mr-3" />
          <input
            type="text"
            placeholder="Pays, ville, colis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-bold text-black placeholder:text-gray-300 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 text-gray-300"><X size={16} /></button>
          )}
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="p-4 bg-[#1D1D4B] text-white rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Tabs horizontales */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
        {[
          { id: 'all', label: 'Tout voir', icon: LayoutGrid },
          { id: 'voyages', label: 'Voyages', icon: Plane },
          { id: 'colis', label: 'Colis', icon: Package }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-[#1D1D4B] text-white border-[#1D1D4B]' : 'bg-white text-gray-400 border-gray-100'
              }`}
          >
            <tab.icon size={14} className={tab.id === 'voyages' ? 'rotate-45' : ''} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Liste des annonces */}
      <div className="space-y-4 pb-4">
        {filteredAds.length > 0 ? filteredAds.map(ad => (
          <div
            key={ad.id}
            onClick={() => onSelectAd(ad)}
            className="bg-white border text-left border-gray-100 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] active:scale-[0.99] transition-all relative overflow-hidden cursor-pointer"
          >
            <div>
              {ad.type === 'colis' ? (
                <div className="mb-4 overflow-hidden rounded-2xl border border-green-50 bg-green-50">
                  {ad.mediaURL ? (
                    <img src={ad.mediaURL} alt={ad.category || ad.description || 'Colis'} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-gradient-to-br from-green-50 to-white text-green-400">
                      <Package size={36} />
                    </div>
                  )}
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-500">Colis sécurisé</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-green-500 shadow-sm">
                      Photo vérifiée
                    </span>
                  </div>
                </div>
              ) : null}

              <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[9px] font-bold uppercase tracking-tight text-white ${ad.type === 'voyage' ? 'bg-[#FF5722]' : 'bg-[#22C55E]'}`}>
                {ad.type}
              </div>

              <div className="flex justify-between items-center mb-5">
                <div
                  className="flex items-center gap-3 group cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUser({ name: ad.userName, initials: ad.userInitials, rating: ad.userRating, uid: ad.userId });
                  }}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm group-active:scale-95 transition-transform ${ad.type === 'voyage' ? 'bg-[#FFE082] text-[#1D1D4B] border-[#FFE082]' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                    {ad.userInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-black text-sm group-hover:underline">{ad.userName}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={10} className="fill-[#FFB300] text-[#FFB300]" />
                      <span className="text-[10px] font-bold text-black">{ad.userRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-gray-300">
                    <Eye size={14} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold">{ad.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-300">
                    <Heart size={14} className={favorites.includes(ad.id) ? 'fill-[#FF5722] text-[#FF5722]' : ''} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold">{ad.likes?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-between mb-5 relative cursor-pointer"
                onClick={() => onSelectAd(ad)}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-gray-300 tracking-wide">Départ</span>
                  <span className="text-sm font-semibold text-black">{ad.origin}</span>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 px-4 relative">
                  <span className="text-[10px] font-bold text-gray-300 mb-1.5">{ad.date}</span>
                  <div className="w-full h-[1px] bg-gray-50 relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                      {ad.type === 'voyage' ? <Plane size={12} className="text-[#FF5722] rotate-45" /> : <Package size={12} className="text-[#22C55E]" />}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-0.5 text-right pr-10">
                  <span className="text-[9px] font-bold text-gray-300 tracking-wide">Arrivée</span>
                  <span className="text-sm font-semibold text-black">{ad.destination}</span>
                </div>
              </div>
            </div>

            <button
              className="absolute right-4 top-14 p-2 active:scale-125 transition-transform z-10"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(ad.id);
              }}
            >
              <Heart
                size={22}
                strokeWidth={2.5}
                className={favorites.includes(ad.id) ? 'fill-[#FF5722] text-[#FF5722]' : 'text-gray-300'}
              />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectAd(ad);
              }}
              className="w-full py-3 bg-gray-50/80 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-2 transition-all border border-gray-100/50"
            >
              {ad.type === 'voyage' ? 'Contacter le voyageur' : 'Faire une offre'}
              <ChevronRight size={14} />
            </button>
          </div>
        )) : (
          <div className="py-20 text-center opacity-30 flex flex-col items-center">
            <SearchIcon size={48} className="mb-4" />
            <p className="font-bold">Aucune annonce trouvée</p>
          </div>
        )}
      </div>

      {/* Popup des filtres détaillés */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-[40px] sm:rounded-[32px] p-6 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">Filtres de recherche</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 text-gray-400 active:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-8 pr-1">
              {/* Itinéraire */}
              <section className="space-y-4">
                <h3 className="text-sm font-extrabold text-black flex items-center gap-2">
                  <ArrowUpDown size={18} className="text-black" /> Itinéraire
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 ml-1">Ville de départ</label>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
                      <Map size={16} className="text-gray-300" />
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="Ex: Paris"
                        className="bg-transparent text-sm font-bold text-black focus:outline-none w-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 ml-1">Ville d'arrivée</label>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
                      <MapPin size={16} className="text-gray-300" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Ex: Cotonou"
                        className="bg-transparent text-sm font-bold text-black focus:outline-none w-full"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Dates */}
              <section className="space-y-4">
                <h3 className="text-sm font-extrabold text-black flex items-center gap-2">
                  <Calendar size={18} className="text-black" /> Dates du vol
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <DateInputField label="Départ" value={departureDate} onChange={setDepartureDate} />
                  <DateInputField label="Arrivée" value={arrivalDate} onChange={setArrivalDate} />
                </div>
              </section>

              {/* Budget & Poids */}
              <div className="grid grid-cols-2 gap-4">
                <section className="space-y-4">
                  <h3 className="text-sm font-extrabold text-black flex items-center gap-2">
                    <Euro size={18} className="text-black" /> Prix Max
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                    <span className="text-xl font-black text-[#FF5722]">{maxPrice} €</span>
                    <input
                      type="range" min="1" max="200" value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#FF5722]"
                    />
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="text-sm font-extrabold text-black flex items-center gap-2">
                    <Scale size={18} className="text-black" /> Poids Max
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                    <span className="text-xl font-black text-[#1D1D4B]">{maxWeight} kg</span>
                    <input
                      type="range" min="1" max="50" value={maxWeight}
                      onChange={(e) => setMaxWeight(Number(e.target.value))}
                      className="w-full accent-[#1D1D4B]"
                    />
                  </div>
                </section>
              </div>
            </div>

            <div className="pt-6 flex gap-3">
              <button
                onClick={() => {
                  setOrigin(''); setDestination(''); setDepartureDate(''); setArrivalDate(''); setMaxPrice(100); setMaxWeight(30);
                }}
                className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold text-sm active:bg-gray-200 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-[2] py-4 bg-[#1D1D4B] text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-transform"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchView;
