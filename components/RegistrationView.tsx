import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Sparkles, ChevronRight, X } from 'lucide-react';
import { createUserWithEmailAndPassword, getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

interface RegistrationViewProps {
  onBack: () => void;
  onSignUp: () => void;
}

type LegalDocKey = 'terms' | 'privacy' | null;

const RegistrationView: React.FC<RegistrationViewProps> = ({ onBack, onSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocKey>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1) Le haut de page reste premium, mais sans carte de type onboarding.
  const trustPills = [
    'Compte sécurisé',
    'Profil synchronisé',
    'Conditions visibles'
  ];

  // 2) Création ou mise à jour du profil utilisateur dans Firestore.
  const upsertUserDocument = async (user: any, extraData: Record<string, any> = {}) => {
    const initials = (extraData.name || user.displayName || 'U')
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: extraData.name || user.displayName || 'Utilisateur',
      email: extraData.email || user.email,
      phone: extraData.phone ?? user.phoneNumber ?? '',
      initials,
      rating: 5.0,
      createdAt: new Date().toISOString(),
      photoURL: user.photoURL || null,
      isVerified: false,
      balance: 0,
      bio: '',
      city: '',
      ...extraData
    }, { merge: true });
  };

  const handleSignUp = async () => {
    setError('');

    if (!name || !email || !password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (!acceptedTerms) {
      setError('Vous devez accepter les conditions avant de continuer.');
      return;
    }

    setLoading(true);
    try {
      // 3) Création du compte puis redirection globale vers l'auth si nécessaire.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await upsertUserDocument(userCredential.user, {
        name,
        email,
        phone,
        acceptedTermsAt: new Date().toISOString(),
        acceptedTermsVersion: 'v1.0',
        privacyAccepted: true,
        termsAccepted: true,
        insuranceAcknowledged: true
      });
      onSignUp();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé.');
      } else {
        setError("Une erreur est survenue lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    if (!acceptedTerms) {
      setError("Merci d'accepter les conditions avant de continuer avec Google.");
      return;
    }

    setLoading(true);
    try {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        await upsertUserDocument(result.user, {
          acceptedTermsAt: new Date().toISOString(),
          acceptedTermsVersion: 'v1.0',
          privacyAccepted: true,
          termsAccepted: true,
          insuranceAcknowledged: true
        });
        onSignUp();
      } catch (popupError: any) {
        // 4) Bascule en redirection si le popup Google est bloqué.
        if (
          popupError?.code === 'auth/popup-blocked' ||
          popupError?.code === 'auth/popup-closed-by-user' ||
          popupError?.code === 'auth/cancelled-popup-request'
        ) {
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupError;
      }
    } catch (err: any) {
      console.error('Google Sign Up error:', err);
      setError("Échec de l'inscription avec Google.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 5) Finalisation après redirection Google.
    const finishRedirectGoogle = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result?.user) return;

        await upsertUserDocument(result.user, {
          acceptedTermsAt: new Date().toISOString(),
          acceptedTermsVersion: 'v1.0',
          privacyAccepted: true,
          termsAccepted: true,
          insuranceAcknowledged: true
        });
        onSignUp();
      } catch (err) {
        console.error('Redirect Google signup error:', err);
        setError("Impossible de finaliser l'inscription Google.");
      }
    };

    finishRedirectGoogle();
  }, []);

  const legalDocuments = {
    terms: {
      title: "Conditions Générales d'Utilisation",
      sections: [
        {
          heading: 'Objet de la plateforme',
          text: "Zecolis met en relation des utilisateurs souhaitant expédier des colis et des voyageurs disposés à transporter des biens autorisés, dans le respect des lois applicables."
        },
        {
          heading: 'Comportement autorisé',
          text: "Les annonces, messages et profils doivent rester respectueux. Toute tentative d'arnaque, de fausse identité ou de contournement des règles peut entraîner une suspension."
        }
      ]
    },
    privacy: {
      title: 'Politique de Confidentialité',
      sections: [
        {
          heading: 'Données collectées',
          text: "Nous pouvons collecter votre nom, email, numéro de téléphone, annonces, messages et informations de connexion nécessaires au service."
        },
        {
          heading: 'Utilisation des données',
          text: "Ces données servent à créer votre compte, sécuriser l'accès, gérer les conversations et améliorer l'expérience utilisateur."
        }
      ]
    }
  } as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,87,34,0.10),transparent_30%),radial-gradient(circle_at_top_right,_rgba(29,29,75,0.12),transparent_28%),linear-gradient(180deg,#F7F4EE_0%,#FFFFFF_38%,#FBFBFC_100%)] px-5 py-6 flex flex-col">
      {/* 6) Fond premium discret pour garder de la profondeur sans gros bloc d'introduction. */}
      <div className="absolute -top-24 -left-20 h-60 w-60 rounded-full bg-[#1D1D4B]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-36 -right-20 h-56 w-56 rounded-full bg-[#FF5722]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/85 shadow-[0_10px_30px_rgba(29,29,75,0.08)] backdrop-blur-md active:scale-95 transition-transform"
        >
          <ArrowLeft size={22} className="text-[#1D1D4B]" />
        </button>

        <div className="rounded-full border border-white/70 bg-white/85 px-3 py-1.5 shadow-[0_10px_30px_rgba(29,29,75,0.08)] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1D1D4B]">Compte protégé</span>
          </div>
        </div>
      </div>

      {/* 7) En-tête sobre: le formulaire redevient le centre de la page. */}
      <div className="relative z-10 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#1D1D4B]/45">Inscription</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1D1D4B]">Créez votre compte</h1>
        <p className="mt-3 max-w-[300px] text-sm font-medium leading-relaxed text-gray-500">
          Créez un compte pour commencer à envoyer ou voyager.
        </p>
      </div>

      <div className="relative z-10 flex-1 space-y-5">
        {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}

        {/* 8) Rappel de confiance réduit au minimum pour éviter l'effet mini-landing. */}
        <div className="flex flex-wrap gap-2">
          {trustPills.map((pill) => (
            <div
              key={pill}
              className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-white/90 px-3 py-2 text-[11px] font-semibold text-gray-600 shadow-sm"
            >
              <Sparkles size={14} className="text-[#FF5722]" />
              {pill}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Nom complet</label>
          <div className="flex items-center gap-4 rounded-2xl bg-white/90 px-5 py-4 shadow-[0_10px_30px_rgba(29,29,75,0.06)] ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-[#1D1D4B]/10 transition-all">
            <User size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Jean Dupont"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 placeholder:text-gray-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</label>
          <div className="flex items-center gap-4 rounded-2xl bg-white/90 px-5 py-4 shadow-[0_10px_30px_rgba(29,29,75,0.06)] ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-[#1D1D4B]/10 transition-all">
            <Mail size={20} className="text-gray-400" />
            <input
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 placeholder:text-gray-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Téléphone</label>
          <div className="flex items-center gap-4 rounded-2xl bg-white/90 px-5 py-4 shadow-[0_10px_30px_rgba(29,29,75,0.06)] ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-[#1D1D4B]/10 transition-all">
            <Phone size={20} className="text-gray-400" />
            <input
              type="tel"
              placeholder="Numéro de téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 placeholder:text-gray-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Mot de passe</label>
          <div className="flex items-center gap-4 rounded-2xl bg-white/90 px-5 py-4 shadow-[0_10px_30px_rgba(29,29,75,0.06)] ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-[#1D1D4B]/10 transition-all">
            <Lock size={20} className="text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 placeholder:text-gray-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-300 transition-colors hover:text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Confirmer le mot de passe</label>
          <div className="flex items-center gap-4 rounded-2xl bg-white/90 px-5 py-4 shadow-[0_10px_30px_rgba(29,29,75,0.06)] ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-[#1D1D4B]/10 transition-all">
            <Lock size={20} className="text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-800 placeholder:text-gray-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-300 transition-colors hover:text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-[0_10px_30px_rgba(29,29,75,0.04)]">
          <div className="flex items-start gap-3">
            <input
              id="terms-accept"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1D1D4B] focus:ring-[#1D1D4B]"
            />
            <div className="text-sm leading-relaxed text-slate-700">
              <span>
                En vous inscrivant, vous acceptez nos{' '}
                <button
                  type="button"
                  onClick={() => setActiveLegalDoc('terms')}
                  className="font-bold text-[#FF5722] underline decoration-[#FF5722]/30 underline-offset-2"
                >
                  Conditions Générales d&apos;Utilisation
                </button>
                {' '}et notre{' '}
                <button
                  type="button"
                  onClick={() => setActiveLegalDoc('privacy')}
                  className="font-bold text-[#FF5722] underline decoration-[#FF5722]/30 underline-offset-2"
                >
                  Politique de Confidentialité
                </button>
                .
              </span>
            </div>
          </div>
        </section>

        <div className="space-y-4 pb-8">
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading || !acceptedTerms}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1D1D4B] py-5 text-base font-bold text-white shadow-[0_20px_40px_rgba(29,29,75,0.18)] transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? 'Inscription...' : "S'inscrire"}
            {!loading ? <ChevronRight size={18} /> : null}
          </button>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <span className="relative bg-[#FBFBFC] px-4 text-[10px] font-bold uppercase tracking-widest text-gray-300">
              Ou continuer avec
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading || !acceptedTerms}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white py-5 text-base font-bold text-gray-700 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-center text-sm font-medium text-gray-400"
          >
            Déjà un compte ? Retour à la connexion
          </button>
        </div>
      </div>

      {activeLegalDoc && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 py-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400">Document légal</p>
                <h2 className="text-base font-extrabold text-[#1D1D4B]">{legalDocuments[activeLegalDoc].title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveLegalDoc(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {legalDocuments[activeLegalDoc].sections.map((section) => (
                <div key={section.heading} className="space-y-1">
                  <h3 className="text-sm font-bold text-[#1D1D4B]">{section.heading}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{section.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationView;
