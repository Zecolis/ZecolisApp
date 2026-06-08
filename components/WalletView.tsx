import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Smartphone, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Transaction } from '../types';

interface WalletViewProps {
  currentUser: User | null;
  onBack: () => void;
}

const WalletView: React.FC<WalletViewProps> = ({ currentUser, onBack }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      const sortedData = data.sort((a, b) => {
        const timeA = a.timestamp?.toMillis() || 0;
        const timeB = b.timestamp?.toMillis() || 0;
        return timeB - timeA;
      });
      setTransactions(sortedData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'pending': return <Clock size={16} className="text-amber-500" />;
      case 'failed': return <XCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Blue Gradient */}
      <div className="bg-gradient-to-b from-[#1D1D4B] to-[#14143a] pt-8 pb-16 px-6 rounded-b-[40px] text-white shadow-xl">
        <div className="flex items-center justify-between mb-10">
          <button onClick={onBack} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-bold">Solde en attente</h1>
          <div className="w-10"></div>
        </div>

        <div className="text-center">
          <p className="text-xs font-medium opacity-60 mb-2">Solde Total</p>
          <h2 className="text-5xl font-black mb-1">{formatAmount(currentUser?.balance || 0, 'EUR')}</h2>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
            ~ {new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF' }).format((currentUser?.balance || 0) * 655.957)}
          </p>
        </div>

        <div className="flex justify-center gap-10 mt-10">
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border border-white/5 backdrop-blur-md group-active:scale-95 transition-transform">
              <ArrowDownLeft size={24} />
            </div>
            <span className="text-xs font-bold">Retirer</span>
          </button>
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#1D1D4B] group-active:scale-95 transition-transform shadow-lg shadow-black/10">
              <ArrowUpRight size={24} />
            </div>
            <span className="text-xs font-bold">Recharger</span>
          </button>
        </div>
      </div>

      <div className="px-6 -mt-8">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-black/5 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone size={20} className="text-[#1D1D4B]" />
            <h3 className="text-sm font-bold text-[#1D1D4B]">Retrait Mobile Money</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="border border-gray-100 rounded-2xl p-5 flex flex-col items-center gap-3 active:bg-gray-50 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-white font-black text-xs">
                MTN
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">MTN Momo</span>
            </button>
            <button className="border border-gray-100 rounded-2xl p-5 flex flex-col items-center gap-3 active:bg-gray-50 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-[#FF5722] rounded-full flex items-center justify-center text-white font-black text-xs">
                OM
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Moov Money</span>
            </button>
          </div>
        </div>

        <div className="mt-8 px-2 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-[#FF5722] rounded-full"></div>
            <h3 className="text-base font-bold text-[#1D1D4B]">Historique</h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-20">
              <div className="w-10 h-10 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-gray-50">
              <p className="text-sm text-gray-400 font-medium">Aucune transaction trouvée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(t => (
                <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-50 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'credit' || t.type === 'deposit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {t.type === 'credit' || t.type === 'deposit' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1D1D4B]">{t.item}</h4>
                      <p className="text-[10px] font-medium text-gray-400">
                        {t.timestamp?.toDate().toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${t.type === 'credit' || t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'credit' || t.type === 'deposit' ? '+' : '-'}{formatAmount(t.amount, t.currency)}
                    </p>
                    <div className="flex items-center justify-end gap-1">
                      {getStatusIcon(t.status)}
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletView;
