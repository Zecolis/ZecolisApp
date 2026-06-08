
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, FileText, User, Camera } from 'lucide-react';

interface VerificationViewProps {
  step: 'intro' | 'choice' | 'upload';
  onBack: () => void;
  onNext: () => void;
  selectedDocType?: 'cni' | 'passport' | null;
}

const VerificationView: React.FC<VerificationViewProps> = ({ step, onBack, onNext, selectedDocType }) => {
  const [selectedDoc, setSelectedDoc] = useState<'cni' | 'passport' | null>(selectedDocType || null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  if (step === 'intro') {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <header className="flex items-center px-4 py-5 bg-white border-b border-gray-100">
          <button onClick={onBack} className="p-2 text-[#1D1D4B]"><ArrowLeft size={24} /></button>
          <h1 className="flex-1 text-center text-base font-bold text-[#1D1D4B] pr-8">Vérification d'identité</h1>
        </header>

        <div className="p-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-900 rounded-b-full flex items-center justify-center text-white mb-8">
            <ShieldCheck size={40} />
          </div>

          <h2 className="text-xl font-bold text-[#1D1D4B] text-center mb-3">Pourquoi vérifier votre identité ?</h2>
          <p className="text-xs text-gray-400 text-center leading-relaxed mb-10 px-4">
            La confiance est le pilier de ZEcolis. La vérification est obligatoire pour transporter des colis et recevoir des paiements.
          </p>

          <div className="w-full space-y-4 mb-10">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full border border-indigo-50 flex items-center justify-center text-indigo-900">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[#1D1D4B]">Badge Vérifié</h4>
                <p className="text-[10px] font-medium text-gray-400 leading-relaxed">
                  Obtenez un badge sur votre profil pour rassurer les autres membres.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full border border-indigo-50 flex items-center justify-center text-indigo-900">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[#1D1D4B]">Accès aux paiements</h4>
                <p className="text-[10px] font-medium text-gray-400 leading-relaxed">
                  Indispensable pour retirer vos gains de votre portefeuille.
                </p>
              </div>
            </div>

            <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
              <AlertCircle size={20} className="text-amber-600 mt-1 shrink-0" />
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                Vos documents sont chiffrés et stockés de manière sécurisée. Ils ne sont jamais partagés avec d'autres utilisateurs.
              </p>
            </div>
          </div>

          <button onClick={onNext} className="w-full h-14 bg-[#1D1D4B] text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-transform">
            Commencer
          </button>
        </div>
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <header className="flex items-center px-4 py-5 bg-white border-b border-gray-100">
          <button onClick={onBack} className="p-2 text-[#1D1D4B]"><ArrowLeft size={24} /></button>
          <h1 className="flex-1 text-center text-base font-bold text-[#1D1D4B] pr-8">Scanner le document</h1>
        </header>

        <div className="p-8 flex-1 flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1D1D4B] mb-2">Prenez une photo</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Assurez-vous que votre {selectedDoc === 'cni' ? "carte d'identité" : "passeport"} est bien lisible et entièrement dans le cadre.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCapture}
          />

          <div
            onClick={triggerInput}
            className="flex-1 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden text-center group active:bg-gray-100 transition-colors cursor-pointer relative"
          >
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#1D1D4B] shadow-sm mb-6 group-active:scale-95 transition-transform">
                  <Camera size={40} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-bold text-[#1D1D4B] mb-1">Cliquer pour prendre une photo</p>
                <p className="text-[10px] font-medium text-gray-400">Ou faites glisser un fichier ici</p>
              </>
            )}
            {capturedImage && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                Cliquer pour changer la photo
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-900 shadow-sm font-black text-xs">1</div>
              <p className="text-[10px] font-bold text-indigo-900 leading-relaxed">
                Placez le document sur une surface plane et bien éclairée.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <button
            onClick={onNext}
            disabled={!capturedImage}
            className={`w-full h-14 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-transform ${capturedImage ? 'bg-[#1D1D4B] text-white' : 'bg-gray-100 text-gray-300'}`}
          >
            Soumettre pour vérification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-inter">
      <header className="flex items-center px-4 py-5 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-[#1D1D4B]"><ArrowLeft size={24} /></button>
        <h1 className="flex-1 text-center text-base font-bold text-[#1D1D4B] pr-8">Vérification d'identité</h1>
      </header>

      <div className="p-8 space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-black text-[#1D1D4B] mb-2 tracking-tight">Choisissez un document</h2>
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Type de pièce d'identité</p>
        </div>

        <button
          onClick={() => setSelectedDoc('cni')}
          className={`w-full p-5 border rounded-3xl flex items-center gap-5 transition-all ${selectedDoc === 'cni' ? 'border-indigo-900 bg-indigo-50/30' : 'border-gray-100 bg-white'}`}
        >
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
            <FileText size={28} />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-base font-bold text-[#1D1D4B]">Carte d'identité</h4>
            <p className="text-[10px] font-bold text-gray-400">CNI valide</p>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedDoc === 'cni' ? 'border-indigo-900 bg-indigo-900' : 'border-gray-200'}`}>
            {selectedDoc === 'cni' && <div className="w-2 h-2 bg-white rounded-full"></div>}
          </div>
        </button>

        <button
          onClick={() => setSelectedDoc('passport')}
          className={`w-full p-5 border rounded-3xl flex items-center gap-5 transition-all ${selectedDoc === 'passport' ? 'border-indigo-900 bg-indigo-50/30' : 'border-gray-100 bg-white'}`}
        >
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
            <User size={28} />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-base font-bold text-[#1D1D4B]">Passeport</h4>
            <p className="text-[10px] font-bold text-gray-400">International</p>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedDoc === 'passport' ? 'border-indigo-900 bg-indigo-900' : 'border-gray-200'}`}>
            {selectedDoc === 'passport' && <div className="w-2 h-2 bg-white rounded-full"></div>}
          </div>
        </button>
      </div>

      <div className="mt-auto p-8">
        <button
          disabled={!selectedDoc}
          onClick={() => onNext()} // Transition handled by parent state
          className={`w-full h-14 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all ${selectedDoc ? 'bg-[#1D1D4B] text-white' : 'bg-gray-100 text-gray-300'}`}
        >
          Continuer
        </button>
      </div>
    </div>
  );
};

export default VerificationView;
