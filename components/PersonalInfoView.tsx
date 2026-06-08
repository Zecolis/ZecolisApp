import React, { useState } from 'react';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, X } from 'lucide-react';
import { User as UserType } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface PersonalInfoViewProps {
  currentUser: UserType | null;
  onBack: () => void;
  onUpdateUser: (data: Partial<UserType>) => void;
}

const PersonalInfoView: React.FC<PersonalInfoViewProps> = ({ currentUser, onBack, onUpdateUser }) => {
  const [isPhotoEnlarged, setIsPhotoEnlarged] = useState(false);
  const [loading, setLoading] = useState(false);

  // Split name into first and last name if possible
  const nameParts = currentUser?.name?.split(' ') || [];
  const initialFirstName = nameParts[0] || '';
  const initialLastName = nameParts.slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email] = useState(currentUser?.email || ''); // Email is usually not editable easily via this form
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  const handleSave = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const updates = {
        name: fullName,
        phone,
        city,
        bio
      };

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, updates);

      onUpdateUser(updates);
      // alert('Modifications enregistrées !'); // Optional interaction
      onBack();
    } catch (e) {
      console.error("Error updating profile: ", e);
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-5 flex items-center">
        <button onClick={onBack} className="p-2 text-black">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-black pr-8">Infos Personnelles</h1>
      </header>

      {/* Profile Picture Section */}
      <div className="flex flex-col items-center mt-8 mb-8">
        <div className="relative">
          <button
            onClick={() => setIsPhotoEnlarged(true)}
            className="w-28 h-28 bg-[#9B8476] rounded-full flex items-center justify-center text-black font-medium text-4xl shadow-sm active:scale-95 transition-transform"
          >
            {currentUser?.initials || 'LA'}
          </button>
          <button className="absolute bottom-1 right-1 w-9 h-9 bg-[#1D1D4B] rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform">
            <Camera size={18} />
          </button>
        </div>
        <p className="mt-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          Cliquez pour changer la photo
        </p>
      </div>

      {/* Form Card */}
      <div className="mx-5 bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1">Prénom</label>
            <div className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center gap-3">
              <User size={16} className="text-gray-300" />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-transparent text-sm font-semibold text-black focus:outline-none w-full"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1">Nom</label>
            <div className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center gap-3">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-transparent text-sm font-semibold text-black focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-1.5 opacity-60">
          <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1">Email (non modifiable)</label>
          <div className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <Mail size={16} className="text-gray-300" />
            <input
              type="email"
              value={email}
              readOnly
              className="bg-transparent text-sm font-semibold text-black focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Phone Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1">Téléphone</label>
          <div className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <Phone size={16} className="text-gray-300" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+229..."
              className="bg-transparent text-sm font-semibold text-black focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Residence Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1">Ville de résidence</label>
          <div className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <MapPin size={16} className="text-gray-300" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Paris, France"
              className="bg-transparent text-sm font-semibold text-black focus:outline-none w-full placeholder:text-gray-300 placeholder:font-medium"
            />
          </div>
        </div>

        {/* Bio Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1">Bio</label>
          <div className="bg-gray-50 rounded-2xl px-4 py-3.5">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Parlez de vous..."
              className="bg-transparent text-sm font-semibold text-black focus:outline-none w-full min-h-[100px] resize-none placeholder:text-gray-300 placeholder:font-medium"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="px-5 mt-8">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full h-14 bg-[#1D1D4B] text-white rounded-2xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
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
          <div className="w-full max-w-[340px] aspect-square bg-[#9B8476] rounded-[60px] flex items-center justify-center text-black font-black text-8xl shadow-2xl border-8 border-white/10 animate-in fade-in zoom-in duration-300">
            {currentUser?.initials || 'LA'}
          </div>
          <p className="mt-10 text-white text-xl font-black uppercase tracking-wider">{currentUser?.name}</p>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoView;
