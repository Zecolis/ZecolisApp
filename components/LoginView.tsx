import React, { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { signInWithEmailAndPassword, getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import zecolisLogo from '../assets/zecolis_logo.png';

interface LoginViewProps {
  onSignUp: () => void;
  onLogin: () => void;
  onForgotPassword: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onSignUp, onLogin, onForgotPassword }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Centralise la création du profil Firestore pour les connexions Google.
  const upsertGoogleUserDocument = async (user: any) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const initials = (user.displayName || 'U')
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName || 'Utilisateur',
        email: user.email,
        phone: '',
        initials,
        rating: 5.0,
        createdAt: new Date().toISOString(),
        photoURL: user.photoURL || null,
        isVerified: false,
        balance: 0,
        bio: '',
        city: ''
      }, { merge: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLogin();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError("Email ou mot de passe incorrect.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Adresse email invalide.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Trop de tentatives. Réessayez dans quelques minutes.");
      } else {
        setError('Échec de la connexion. Vérifiez vos identifiants.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        await upsertGoogleUserDocument(result.user);
        onLogin();
      } catch (popupError: any) {
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
      console.error('Google Login error:', err);
      setError('Échec de la connexion avec Google.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const finishRedirectGoogleLogin = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result?.user) return;
        await upsertGoogleUserDocument(result.user);
        onLogin();
      } catch (err) {
        console.error('Redirect Google login error:', err);
        setError('Impossible de finaliser la connexion Google après redirection.');
      }
    };

    finishRedirectGoogleLogin();
  }, []);

  return (
    <div className="relative bg-gradient-to-b from-[#F7F4EE] via-white to-[#FFFFFF] min-h-screen px-5 py-6 flex flex-col overflow-hidden">
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#FF5722]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-16 w-48 h-48 rounded-full bg-[#1D1D4B]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_14px_34px_rgba(29,29,75,0.12)] ring-1 ring-black/5">
            <img src={zecolisLogo} alt="ZE Colis" className="h-full w-full object-contain p-1" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#1D1D4B]/45">ZE Colis</p>
            <p className="text-sm font-semibold text-[#1D1D4B]">Connexion</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 border border-gray-100 shadow-sm">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1D1D4B]">Connexion sécurisée</span>
        </div>
      </div>

      <div className="relative z-10 mb-8">
        <h1 className="text-3xl font-black text-[#1D1D4B] mb-3 tracking-tight">Bon retour !</h1>
        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-[300px]">
          Connectez-vous pour continuer à envoyer ou voyager.
        </p>
      </div>

      <form onSubmit={handleLogin} className="relative z-10 flex-1 space-y-6">
        {error && <div className="text-red-500 text-sm font-bold">{error}</div>}

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">EMAIL</label>
          <div className="bg-gray-50 rounded-2xl px-5 py-4 flex items-center gap-4 focus-within:ring-2 focus-within:ring-[#1D1D4B]/5 transition-all">
            <Mail size={20} className="text-gray-400" />
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none w-full placeholder:text-gray-300"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MOT DE PASSE</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[10px] font-bold text-[#FF5722] uppercase tracking-widest"
            >
              Oublié ?
            </button>
          </div>
          <div className="bg-gray-50 rounded-2xl px-5 py-4 flex items-center gap-4 focus-within:ring-2 focus-within:ring-[#1D1D4B]/5 transition-all">
            <Lock size={20} className="text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none w-full placeholder:text-gray-300"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-300 hover:text-gray-500 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#1D1D4B] text-white rounded-2xl font-bold text-base shadow-xl shadow-[#1D1D4B]/20 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <span className="relative bg-white px-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              Ou continuer avec
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-5 bg-white border border-gray-100 text-gray-700 rounded-2xl font-bold text-base shadow-sm active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <p className="text-center text-sm font-medium text-gray-400">
            Pas encore de compte ?{' '}
            <button
              type="button"
              onClick={onSignUp}
              className="text-[#FF5722] font-bold"
            >
              S'inscrire
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginView;
