
import React from 'react';
import { ArrowLeft, Heart, Star, Eye, CheckCircle2, Calendar, Package, Euro, MessageSquare, AlignLeft, Box, Info } from 'lucide-react';
import { Ad } from '../types';

interface DetailsViewProps {
  ad: Ad;
  onBack: () => void;
  isFavorite: boolean;
  toggleFavorite: () => void;
  onContact: () => void;
}

import { db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useEffect } from 'react';

// ... inside component ...
const DetailsView: React.FC<DetailsViewProps> = ({ ad, onBack, isFavorite, toggleFavorite, onContact }) => {
  const isVoyage = ad.type === 'voyage';

  useEffect(() => {
    // Increment views
    const incrementView = async () => {
      try {
        const adRef = doc(db, 'ads', ad.id);
        await updateDoc(adRef, {
          views: increment(1)
        });
      } catch (e) {
        console.error("Error incrementing views:", e);
      }
    };
    incrementView();
  }, [ad.id]);

  return (
    <div className="bg-white min-h-screen flex flex-col relative">
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-5 bg-white border-b border-gray-50">
        <button onClick={onBack} className="p-1 text-black"><ArrowLeft size={24} /></button>
        <h1 className="text-base font-bold text-black">{isVoyage ? 'Détails du voyage' : "Détails de l'envoi"}</h1>
        <button
          onClick={toggleFavorite}
          className={`p-1 transition-transform active:scale-125 ${isFavorite ? 'text-[#FF5722]' : 'text-gray-300'}`}
        >
          <Heart size={24} className={isFavorite ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-32">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border border-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${isVoyage ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                {ad.userInitials}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm"><CheckCircle2 size={16} className="text-[#22C55E] fill-white" /></div>
            </div>
            <div>
              <h2 className="text-base font-bold text-black mb-0.5">{ad.userName}</h2>
              <div className="flex items-center gap-1.5">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-500">{ad.userRating}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1 text-gray-300">
              <Eye size={18} /><span className="text-[10px] font-bold">{ad.views || 0}</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-gray-300">
              <Heart size={18} className={ad.likes?.length ? 'fill-[#FF5722] text-[#FF5722]' : ''} /><span className="text-[10px] font-bold">{ad.likes?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-300 mb-1">Ville de départ</span>
              <span className="text-lg font-bold text-black">{ad.origin}</span>
            </div>
            <div className="flex-1 px-4 relative flex items-center justify-center">
              <div className="w-full h-[1px] bg-gray-100"></div>
              <div className="absolute p-2 bg-[#FF5722] rounded-lg">
                {isVoyage ? <Calendar size={14} className="text-white" /> : <Box size={14} className="text-white" />}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-300 mb-1">Ville d'arrivée</span>
              <span className="text-lg font-bold text-black">{ad.destination}</span>
            </div>
          </div>
          <div className="bg-gray-50/50 rounded-lg py-3 text-center">
            <p className="text-[11px] font-bold text-gray-400 tracking-wider">{ad.date}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50/40 rounded-xl p-5 flex flex-col gap-2 border border-blue-50">
            <div className="p-2 bg-white w-fit rounded-lg shadow-sm text-blue-500"><Package size={18} /></div>
            <div>
              <span className="text-[10px] font-bold text-blue-900/30 block">Poids disponible</span>
              <span className="text-xl font-bold text-blue-900">{ad.weight?.split(' ')[0]} kg</span>
            </div>
          </div>
          <div className="bg-orange-50/40 rounded-xl p-5 flex flex-col gap-2 border border-orange-50">
            <div className="p-2 bg-white w-fit rounded-lg shadow-sm text-[#FF5722]"><Euro size={18} /></div>
            <div>
              <span className="text-[10px] font-bold text-[#FF5722]/30 block">Prix par kg</span>
              <span className="text-xl font-bold text-[#FF5722]">{ad.price} €</span>
            </div>
          </div>
        </div>

        <section className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-white rounded-lg shadow-sm text-gray-400">
              {isVoyage ? <Info size={16} /> : <AlignLeft size={16} />}
            </div>
            <h3 className="text-xs font-bold text-black tracking-wide">
              {isVoyage ? "Description du voyage" : "Détails du colis"}
            </h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            {ad.description || "Aucune description supplémentaire fournie pour cette annonce."}
          </p>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 py-6 bg-white flex items-center gap-3 border-t border-gray-50">
        <button onClick={onContact} className="w-14 h-14 rounded-xl border border-gray-100 flex items-center justify-center text-black bg-white active:bg-gray-50">
          <MessageSquare size={22} />
        </button>
        <button onClick={onContact} className="flex-1 h-14 rounded-xl bg-black text-white font-bold text-[13px] active:scale-95 shadow-lg shadow-black/10">
          {isVoyage ? 'Réserver maintenant' : 'Proposer de transporter'}
        </button>
      </div>
    </div>
  );
};

export default DetailsView;
