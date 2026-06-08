
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, MapPin, Calendar, Shirt, Laptop, Utensils, Box,
  Euro, Plus, Minus, Plane, Package, Map, FileText, Info, Scale, Edit3
} from 'lucide-react';
import { SearchCriteria, Ad, User } from '../types';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface PublishViewProps {
  currentUser: User | null;
  initialType?: 'colis' | 'voyage';
  editingAd?: Ad | null;
  onBack: () => void;
  onFindTraveler: (criteria: SearchCriteria) => void;
}

const DateInput = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-black ml-1">{label}</label>
    <div className="flex items-center gap-3 px-3 py-3.5 bg-gray-50 rounded-lg focus-within:ring-2 focus-within:ring-[#1D1D4B]/10 transition-all border border-transparent">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs font-bold text-black focus:outline-none placeholder:text-gray-300"
        />
      </div>
      <div className="relative">
        <Calendar size={16} className="text-gray-400" />
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

const ItineraryInputs = ({ origin, setOrigin, destination, setDestination }: { origin: string, setOrigin: (v: string) => void, destination: string, setDestination: (v: string) => void }) => (
  <div className="relative pl-9 space-y-6">
    <div className="absolute left-[7px] top-[24px] bottom-[24px] w-[2px] border-l-2 border-dotted border-gray-200"></div>

    <div className="relative">
      <label className="text-[11px] font-bold text-black block mb-1.5">Lieu de départ</label>
      <div className="absolute -left-[31px] top-[40px] -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm z-10"></div>
      <div className="bg-gray-50 rounded-lg px-4 py-3">
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Ex: Paris, France"
          className="w-full bg-transparent text-sm font-bold text-black focus:outline-none placeholder:text-gray-300"
        />
      </div>
    </div>

    <div className="relative">
      <label className="text-[11px] font-bold text-black block mb-1.5">Lieu d'arrivée</label>
      <MapPin size={18} className="absolute -left-[33px] top-[40px] -translate-y-1/2 text-[#FF5722] z-10" />
      <div className="bg-gray-50 rounded-lg px-4 py-3">
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Ex: Cotonou, Bénin"
          className="w-full bg-transparent text-sm font-bold text-black focus:outline-none placeholder:text-gray-300"
        />
      </div>
    </div>
  </div>
);

const PublishView: React.FC<PublishViewProps> = ({ currentUser, initialType = 'colis', editingAd, onBack, onFindTraveler }) => {
  const [type, setType] = useState<'colis' | 'voyage'>(initialType);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [weight, setWeight] = useState(10);
  const [pricePerKg, setPricePerKg] = useState(12);
  const [category, setCategory] = useState('HABITS');
  const [customCategory, setCustomCategory] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  // Pré-remplir les données en mode édition
  useEffect(() => {
    if (editingAd) {
      setType(editingAd.type);
      setOrigin(editingAd.origin);
      setDestination(editingAd.destination);
      setDetails(editingAd.description || '');
      setWeight(parseInt(editingAd.weight?.split(' ')[0] || '10'));
      setPricePerKg(editingAd.price || 12);
      if (editingAd.category) {
        const knownCat = ['HABITS', 'TECH', 'BOUFFE'].includes(editingAd.category);
        if (knownCat) {
          setCategory(editingAd.category);
        } else {
          setCategory('AUTRE');
          setCustomCategory(editingAd.category);
        }
      }
    }
  }, [editingAd]);

  const handlePublish = async () => {
    // Si c'est un colis, on redirige vers la recherche de voyageur
    if (type === 'colis') {
      onFindTraveler({
        origin,
        destination,
        date: departureDate,
        weight: weight.toString(),
        category: category === 'AUTRE' ? customCategory : category
      });
      return;
    }

    if (!currentUser) return;
    setLoading(true);

    try {
      const adData = {
        userId: currentUser.uid,
        userName: currentUser.name,
        userInitials: currentUser.initials,
        userRating: currentUser.rating,
        type,
        origin,
        destination,
        date: `${departureDate} - ${arrivalDate}`,
        weight: `${weight} kg`,
        price: pricePerKg,
        description: details,
        category: category === 'AUTRE' ? customCategory : category,
        createdAt: serverTimestamp(),
        views: 0,
        likes: [],
        status: 'ACTIVE'
      };

      if (editingAd) {
        const adRef = doc(db, 'ads', editingAd.id);
        await updateDoc(adRef, adData);
      } else {
        await addDoc(collection(db, 'ads'), adData);
      }
      onBack();
    } catch (e) {
      console.error("Error publishing ad: ", e);
      alert("Erreur lors de la publication");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'HABITS', label: 'Habits', icon: Shirt },
    { id: 'TECH', label: 'Tech', icon: Laptop },
    { id: 'BOUFFE', label: 'Bouffe', icon: Utensils },
    { id: 'AUTRE', label: 'Autre', icon: Box },
  ];

  const renderParcelForm = () => (
    <div className="space-y-5">
      <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-extrabold text-black flex items-center gap-2 mb-5">
          <Map size={18} className="text-black" /> Itinéraire du colis
        </h3>
        <ItineraryInputs origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination} />
      </section>

      <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-extrabold text-black flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-black" /> Date de l'expédition
        </h3>
        <DateInput
          label="Départ souhaité"
          value={departureDate}
          onChange={setDepartureDate}
          placeholder="JJ/MM/AAAA ou JJ-MM-AAAA"
        />
      </section>

      <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-extrabold text-black flex items-center gap-2 mb-4">
          <Scale size={18} className="text-black" /> Poids et catégorie
        </h3>
        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-[11px] font-bold text-black">Poids du colis</label>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3.5 focus-within:ring-2 focus-within:ring-[#1D1D4B]/10 transition-all">
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-16 bg-transparent text-xl font-bold text-black focus:outline-none"
              />
              <span className="text-xs font-bold text-black">kg</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setWeight(w => w + 1)} className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 shadow-sm active:scale-90 transition-transform"><Plus size={16} /></button>
              <button onClick={() => setWeight(w => Math.max(1, w - 1))} className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 shadow-sm active:scale-90 transition-transform"><Minus size={16} /></button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-black">Catégorie du colis</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl gap-1 transition-all border ${category === cat.id ? 'bg-[#1D1D4B] border-[#1D1D4B] text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'
                    }`}
                >
                  <cat.icon size={20} />
                  <span className="text-[8px] font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input dynamique pour la catégorie "Autre" */}
          {category === 'AUTRE' && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-black ml-1">Préciser la catégorie / Nature</label>
                <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#1D1D4B]/10 transition-all border border-transparent">
                  <Edit3 size={16} className="text-gray-300" />
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Ex: Instruments de musique, Documents..."
                    className="w-full bg-transparent text-sm font-bold text-black focus:outline-none placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-extrabold text-black flex items-center gap-2 mb-4">
          <FileText size={18} className="text-black" /> Informations complémentaires
        </h3>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-black">Détails optionnels</label>
          <textarea
            placeholder="Contenu précis, fragilité, dimensions ou toute autre info utile..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full bg-gray-50 rounded-lg p-3.5 text-sm font-semibold text-black focus:outline-none min-h-[100px] resize-none focus:ring-2 focus:ring-[#1D1D4B]/10"
          ></textarea>
        </div>
      </section>

      <button onClick={handlePublish} className="w-full py-4 bg-[#22C55E] text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform mb-6">
        {editingAd ? 'Enregistrer les modifications' : 'Trouver un voyageur'}
      </button>
    </div>
  );

  const renderTripForm = () => (
    <div className="space-y-5">
      <div className="bg-[#1D1D4B] rounded-xl p-6 text-white flex justify-between items-center shadow-md">
        <div>
          <h2 className="text-xl font-bold">Gagnez {weight * pricePerKg}€</h2>
          <p className="text-[10px] font-medium opacity-60">Basé sur vos {weight} kg disponibles.</p>
        </div>
        <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
          <Euro size={22} />
        </div>
      </div>

      <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-extrabold text-black flex items-center gap-2 mb-5">
          <Map size={18} className="text-black" /> Itinéraire du voyage
        </h3>
        <ItineraryInputs origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination} />
      </section>

      <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-extrabold text-black flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-black" /> Dates du voyage
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <DateInput
            label="Départ du vol"
            value={departureDate}
            onChange={setDepartureDate}
            placeholder="JJ/MM/AAAA"
          />
          <DateInput
            label="Arrivée du vol"
            value={arrivalDate}
            onChange={setArrivalDate}
            placeholder="JJ/MM/AAAA"
          />
        </div>
      </section>

      <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-extrabold text-black flex items-center gap-2 mb-4">
          <Info size={18} className="text-black" /> Description
        </h3>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-black">Détails du voyage</label>
          <textarea
            placeholder="Disponibilités, escales, préférences..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full bg-gray-50 rounded-lg p-3.5 text-sm font-semibold text-black focus:outline-none min-h-[100px] resize-none focus:ring-2 focus:ring-[#1D1D4B]/10"
          ></textarea>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-extrabold text-black flex items-center gap-2 mb-3">
            <Scale size={16} className="text-black" /> Poids (kg)
          </h3>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 focus-within:ring-2 focus-within:ring-[#1D1D4B]/10 transition-all">
            <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-12 bg-transparent text-xl font-bold text-black focus:outline-none" />
            <div className="flex flex-col gap-1">
              <button onClick={() => setWeight(w => w + 1)} className="p-1.5 bg-white rounded-md border border-gray-100 text-gray-400 shadow-sm active:scale-90 transition-transform"><Plus size={12} /></button>
              <button onClick={() => setWeight(w => Math.max(1, w - 1))} className="p-1.5 bg-white rounded-md border border-gray-100 text-gray-400 shadow-sm active:scale-90 transition-transform"><Minus size={12} /></button>
            </div>
          </div>
        </section>
        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-extrabold text-black flex items-center gap-2 mb-3">
            <Euro size={16} className="text-black" /> Prix / kg
          </h3>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 focus-within:ring-2 focus-within:ring-[#1D1D4B]/10 transition-all">
            <input type="number" value={pricePerKg} onChange={(e) => setPricePerKg(Number(e.target.value))} className="w-12 bg-transparent text-xl font-bold text-[#FF5722] focus:outline-none" />
            <div className="flex flex-col gap-1">
              <button onClick={() => setPricePerKg(p => p + 1)} className="p-1.5 bg-white rounded-md border border-gray-100 text-gray-400 shadow-sm active:scale-90 transition-transform"><Plus size={12} /></button>
              <button onClick={() => setPricePerKg(p => Math.max(1, p - 1))} className="p-1.5 bg-white rounded-md border border-gray-100 text-gray-400 shadow-sm active:scale-90 transition-transform"><Minus size={12} /></button>
            </div>
          </div>
        </section>
      </div>

      <button onClick={handlePublish} className="w-full py-4 bg-[#1D1D4B] text-white rounded-xl font-bold text-sm active:scale-95 shadow-md transition-transform mb-6">
        {editingAd ? 'Enregistrer les modifications' : 'Publier le trajet'}
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="sticky top-0 z-10 flex items-center px-4 py-5 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-black active:scale-90 transition-transform"><ArrowLeft size={24} /></button>
        <h1 className="flex-1 text-center text-base font-extrabold text-black pr-8">
          {editingAd ? 'Modifier mon annonce' : (type === 'colis' ? 'Expédier un colis' : 'Publier un trajet')}
        </h1>
      </div>

      <div className="p-4">
        {!editingAd && (
          <div className="flex bg-white p-1 rounded-xl border border-gray-100 mb-6 shadow-sm">
            <button onClick={() => setType('colis')} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold transition-all ${type === 'colis' ? 'bg-[#22C55E] text-white shadow-sm' : 'text-gray-400'}`}>
              <Package size={14} /> Colis
            </button>
            <button onClick={() => setType('voyage')} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold transition-all ${type === 'voyage' ? 'bg-[#FF5722] text-white shadow-sm' : 'text-gray-400'}`}>
              <Plane size={14} className="rotate-45" /> Voyage
            </button>
          </div>
        )}
        {type === 'voyage' ? renderTripForm() : renderParcelForm()}
      </div>
    </div>
  );
};

export default PublishView;
