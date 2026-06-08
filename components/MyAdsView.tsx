
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plane, Trash2, Clock, Pencil, Package, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { Ad, User } from '../types';
import { collection, query, where, onSnapshot, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface MyAdsViewProps {
  currentUser: User | null;
  onBack: () => void;
  onEditAd: (ad: any) => void;
}

const MyAdsView: React.FC<MyAdsViewProps> = ({ currentUser, onBack, onEditAd }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'ads'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ad[];
      // Sort client-side or use composite index for orderBy('createdAt', 'desc')
      adsData.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAds(adsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching my ads: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDelete = async (id: string | null) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'ads', id));
      setAdToDelete(null);
    } catch (error) {
      console.error("Error deleting ad: ", error);
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen relative">
      <header className="sticky top-0 z-10 flex items-center px-4 py-5 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-[#1D1D4B] active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-base font-extrabold text-[#1D1D4B] pr-8">Gestion de mes annonces</h1>
      </header>

      <div className="p-5 space-y-4">
        {loading ? (
          <p className="text-center text-gray-400">Chargement...</p>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <Package size={64} className="mb-4" />
            <p className="font-bold">Vous n'avez pas encore d'annonces</p>
          </div>
        ) : (
          ads.map(ad => (
            <div key={ad.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${ad.type === 'voyage' ? 'bg-orange-50 text-[#FF5722]' : 'bg-green-50 text-[#22C55E]'}`}>
                  {ad.type === 'voyage' ? <Plane size={28} className="rotate-45" /> : <Package size={28} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-[#1D1D4B] truncate">
                    {ad.origin} <span className="text-gray-200 font-medium px-1">→</span> {ad.destination}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{ad.date}</span>
                    <div className="flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-full text-[8px] font-black text-red-400 uppercase tracking-tight">
                      <Clock size={8} />
                      {ad.status || 'ACTIF'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => onEditAd(ad)}
                  className="flex-1 h-12 bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-[#1D1D4B] font-bold text-xs active:scale-95 transition-transform border border-gray-100"
                >
                  <Pencil size={16} />
                  Modifier
                </button>
                {ad.status !== 'COMPLETED' && (
                  <button
                    onClick={async () => {
                      if (window.confirm('Confirmer que cette mission est terminée/livrée ?')) {
                        try {
                          await updateDoc(doc(db, 'ads', ad.id), { status: 'COMPLETED' });
                        } catch (e) {
                          console.error("Error updating status:", e);
                        }
                      }
                    }}
                    className="flex-1 h-12 bg-green-50 rounded-xl flex items-center justify-center gap-2 text-[#22C55E] font-bold text-xs active:scale-95 transition-transform border border-green-100"
                  >
                    <CheckCircle size={16} />
                    {ad.type === 'voyage' ? 'Terminer' : 'Livré'}
                  </button>
                )}
                <button
                  onClick={() => setAdToDelete(ad.id)}
                  className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 active:scale-95 transition-transform border border-red-100/50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Popup */}
      {adToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[320px] rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-black text-[#1D1D4B] mb-2">Supprimer l'annonce ?</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed mb-8">
                Cette action est irréversible. Toutes les données associées seront perdues.
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={() => setAdToDelete(null)}
                  className="flex-1 h-14 bg-gray-100 text-gray-400 rounded-2xl font-bold text-sm active:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(adToDelete)}
                  className="flex-1 h-14 bg-red-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-500/20 active:scale-95"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAdsView;
