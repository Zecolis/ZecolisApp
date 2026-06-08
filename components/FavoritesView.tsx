
import React from 'react';
import { ArrowLeft, Heart, Star, ChevronRight, Package, Plane, Bookmark } from 'lucide-react';
import { Ad } from '../types';

interface FavoritesViewProps {
  onBack: () => void;
  onSelectAd: (ad: Ad) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ onBack, onSelectAd, favorites, toggleFavorite }) => {
  // Dans un vrai projet, ces annonces seraient récupérées d'une base de données globale
  const allAds: Ad[] = [
    { 
      id: '1', 
      userName: 'Jiscard Dossou', 
      userInitials: 'JD', 
      userRating: 5.0, 
      tripsCount: 0, 
      origin: 'Paris', 
      destination: 'Cotonou', 
      date: '18 févr', 
      type: 'voyage',
      weight: '18 kg',
      price: 11,
      description: 'Je voyage avec peu de bagages, je peux prendre vos colis.',
      views: 13
    },
    { 
      id: '4', 
      userName: 'Ivo', 
      userInitials: 'IV', 
      userRating: 5.0, 
      tripsCount: 0, 
      origin: 'Paris', 
      destination: 'Cotonou', 
      date: 'Flexible', 
      type: 'colis',
      weight: '3 kg',
      price: 36,
      description: 'Colis de vêtements neufs pour la famille.',
      category: 'CLOTHES',
      views: 1
    }
  ];

  const favoriteAds = allAds.filter(ad => favorites.includes(ad.id));

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 flex items-center px-4 py-5 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-[#1D1D4B]"><ArrowLeft size={24} /></button>
        <h1 className="flex-1 text-center text-base font-bold text-[#1D1D4B] pr-8">Mes Favoris</h1>
      </header>

      <div className="p-5">
        {favoriteAds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
              <Bookmark size={40} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1D1D4B]">Aucun favori pour le moment</h3>
              <p className="text-xs text-gray-400 mt-1">Ajoutez des annonces en favori pour les retrouver ici.</p>
            </div>
            <button 
              onClick={onBack}
              className="px-6 py-2.5 bg-[#1D1D4B] text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-transform"
            >
              Parcourir les annonces
            </button>
          </div>
        ) : (
          <div className="space-y-4 pb-10">
            {favoriteAds.map(ad => (
              <div 
                key={ad.id} 
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm active:scale-[0.99] transition-all relative overflow-hidden"
              >
                <div onClick={() => onSelectAd(ad)}>
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[9px] font-bold uppercase tracking-tight text-white ${ad.type === 'voyage' ? 'bg-[#FF5722]' : 'bg-[#22C55E]'}`}>
                    {ad.type}
                  </div>

                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm ${
                        ad.type === 'voyage' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {ad.userInitials}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1D1D4B] text-sm">{ad.userName}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-bold text-[#1D1D4B]">{ad.userRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-5 relative">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Départ</span>
                      <span className="text-sm font-semibold text-[#1D1D4B]">{ad.origin}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center flex-1 px-4 relative">
                      <span className="text-[9px] font-bold text-gray-300 mb-1.5">{ad.date}</span>
                      <div className="w-full h-[1px] bg-gray-50 relative">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                          {ad.type === 'voyage' ? <Plane size={12} className="text-[#FF5722] rotate-45" /> : <Package size={12} className="text-[#22C55E]" />}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-0.5 text-right pr-10">
                      <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Arrivée</span>
                      <span className="text-sm font-semibold text-[#1D1D4B]">{ad.destination}</span>
                    </div>
                  </div>
                </div>

                <button 
                  className="absolute right-4 top-[85px] p-2 active:scale-125 transition-transform" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleFavorite(ad.id);
                  }}
                >
                  <Heart 
                    size={22} 
                    strokeWidth={2.5} 
                    className='fill-[#FF5722] text-[#FF5722]' 
                  />
                </button>
                
                <button 
                  onClick={() => onSelectAd(ad)}
                  className="w-full py-3 bg-gray-50/80 rounded-xl text-xs font-bold text-[#1D1D4B] flex items-center justify-center gap-2 transition-all border border-gray-100/50"
                >
                  Détails
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesView;
