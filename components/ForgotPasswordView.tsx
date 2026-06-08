import React, { useState } from 'react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

interface ForgotPasswordViewProps {
    onBack: () => void;
}

const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Veuillez entrer votre adresse email.');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess('Un email de réinitialisation a été envoyé à ' + email);
            setEmail('');
        } catch (err: any) {
            console.error("Reset error:", err);
            if (err.code === 'auth/user-not-found') {
                setError('Aucun utilisateur trouvé avec cet email.');
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen px-6 py-12 flex flex-col">
            {/* Bouton Retour */}
            <div className="mb-10">
                <button
                    onClick={onBack}
                    className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-800 shadow-sm active:scale-95 transition-transform"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* Titres */}
            <div className="mb-12">
                <h1 className="text-4xl font-extrabold text-[#1D1D4B] mb-3">Mot de passe oublié ?</h1>
                <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[280px]">
                    Entrez votre email pour recevoir un lien de réinitialisation.
                </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleResetPassword} className="flex-1 space-y-6">
                {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
                {success && <div className="text-green-500 text-sm font-bold">{success}</div>}

                {/* Email */}
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
                        />
                    </div>
                </div>

                {/* Action */}
                <div className="mt-12">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-[#1D1D4B] text-white rounded-2xl font-bold text-base shadow-xl shadow-[#1D1D4B]/20 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                    >
                        {loading ? 'Envoi...' : (
                            <>
                                <Send size={20} />
                                Envoyer le lien
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ForgotPasswordView;
