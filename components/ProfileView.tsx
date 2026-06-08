import React, { useState, useEffect } from 'react';
import {
  Settings, Shield, ChevronRight, Wallet, QrCode, User as UserIcon,
  Layers, Heart, LogOut, ShieldAlert, X, ShieldCheck
} from 'lucide-react';
import { View, User, Ad } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface ProfileViewProps {
  currentUser: User | null;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onNavigate, onLogout }) => {
  const [isPhotoEnlarged, setIsPhotoEnlarged] = useState(false);
  const [stats, setStats] = useState({ trips: 0, parcels: 0, reviews: 0 });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'ads'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let trips = 0;
      let parcels = 0;
      snapshot.forEach(doc => {
        const ad = doc.data() as Ad;
        if (ad.type === 'voyage') trips++;
        if (ad.type === 'colis') parcels++;
      });
      setStats({ trips, parcels, reviews: 5 }); // Reviews are hardcoded for now as per plan
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="bg-[#1D1D4B] h-32 pt-8 px-6 flex justify-end items-start">
        <button className="text-white p-1.5"><Settings size={22} /></button>
      </div>

      <div className="px-5 -mt-16">
        <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col items-center text-center border border-gray-100">
          <div className="relative mb-3">
            <button
              onClick={() => setIsPhotoEnlarged(true)}
              className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-[#1D1D4B] font-semibold text-2xl border-4 border-white shadow-[0_8px_20px_rgba(0,0,0,0.08)] active:scale-95 transition-transform"
            >
              {currentUser.initials}
            </button>
            <div className="absolute bottom-0 right-0 bg-white p-0.5 rounded-full border border-gray-200">
              {currentUser.isVerified ? (
                <ShieldCheck size={16} className="text-green-500" />
              ) : (
                <ShieldAlert size={16} className="text-gray-300" />
              )}
            </div>
          </div>

          <h2 className="text-lg font-bold text-[#1D1D4B] mb-0.5">{currentUser.name}</h2>
          <div className="flex items-center gap-1 mb-4">
            <span className="text-amber-400 font-bold text-base">★</span>
            <span className="text-xs font-bold text-[#1D1D4B]">{currentUser.rating}</span>
            <span className="text-[10px] text-gray-400 font-medium">(0 avis)</span>
          </div>

          <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 mb-6 border ${currentUser.isVerified ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
            {currentUser.isVerified ? (
              <ShieldCheck size={12} className="text-green-500" />
            ) : (
              <ShieldAlert size={12} className="text-gray-400" />
            )}
            <span className={`text-[9px] font-bold uppercase tracking-widest ${currentUser.isVerified ? 'text-green-600' : 'text-gray-400'}`}>
              {currentUser.isVerified ? 'VÉRIFIÉ' : 'NON VÉRIFIÉ'}
            </span>
          </div>

          <div className="grid grid-cols-3 w-full border-t border-gray-50 pt-4">
            <div className="flex flex-col items-center border-r border-gray-50">
              <span className="text-base font-bold text-[#1D1D4B]">{stats.trips}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">VOYAGES</span>
            </div>
            <div className="flex flex-col items-center border-r border-gray-50">
              <span className="text-base font-bold text-[#1D1D4B]">{stats.parcels}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">ENVOIS</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-bold text-[#1D1D4B]">{stats.reviews}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">AVIS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-3 pb-4">
        {!currentUser.isVerified && (
          <button
            onClick={() => onNavigate(View.VERIFY_INTRO)}
            className="w-full bg-white border border-amber-100 rounded-xl p-4 flex items-center gap-3 text-left shadow-sm relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
              <Shield size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#1D1D4B] text-xs">Vérifier mon identité</h4>
              <p className="text-[9px] font-semibold text-gray-300">Requis pour les transactions</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        )}

        <button
          onClick={() => onNavigate(View.WALLET)}
          className="w-full bg-gradient-to-r from-[#1D1D4B] to-[#2E5EF3] rounded-xl p-4 flex items-center gap-3 text-left text-white shadow-md active:scale-[0.98]"
        >
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-xs">Portefeuille</h4>
            <p className="text-[9px] font-semibold opacity-80 uppercase">Solde: {(currentUser.balance || 0).toFixed(2)} €</p>
          </div>
          <ChevronRight size={16} className="opacity-60" />
        </button>

        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
          <MenuButton icon={QrCode} label="Scanner QR Code" darkIcon onClick={() => onNavigate(View.QR_CODE)} />
          <MenuButton icon={UserIcon} label="Informations personnelles" onClick={() => onNavigate(View.PERSONAL_INFO)} />
          <MenuButton icon={Layers} label="Mes annonces" onClick={() => onNavigate(View.MY_ADS)} />
          <MenuButton icon={Heart} label="Mes Favoris" onClick={() => onNavigate(View.FAVORITES)} />
          <MenuButton icon={LogOut} label="Déconnexion" isRed onClick={onLogout} />
        </div>
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
          <div className="w-full max-w-[340px] aspect-square bg-orange-50 rounded-[60px] flex items-center justify-center text-[#1D1D4B] font-black text-8xl shadow-2xl border-8 border-white/10 animate-in fade-in zoom-in duration-300">
            {currentUser.initials}
          </div>
          <p className="mt-10 text-white text-xl font-black uppercase">{currentUser.name}</p>
        </div>
      )}
    </div>
  );
};

const MenuButton = ({ icon: Icon, label, darkIcon, isRed, onClick }: any) => (
  <button onClick={onClick} className="w-full p-3.5 flex items-center gap-3 active:bg-gray-50 transition-colors text-left">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${darkIcon ? 'bg-[#1D1D4B] text-white' : isRed ? 'bg-red-50 text-red-500' : 'bg-indigo-50/50 text-indigo-400'}`}>
      <Icon size={18} />
    </div>
    <span className={`flex-1 text-xs font-bold ${isRed ? 'text-red-500' : 'text-[#1D1D4B]'}`}>{label}</span>
    <ChevronRight size={16} className="text-gray-200" />
  </button>
);

export default ProfileView;
