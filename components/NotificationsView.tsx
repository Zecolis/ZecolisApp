import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, MessageSquare, Heart, Euro, ShieldCheck, Trash2 } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { AppNotification, User } from '../types';

interface NotificationsViewProps {
    currentUser: User | null;
    onBack: () => void;
    onNavigateToItem: (type: string, relatedId: string) => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ currentUser, onBack, onNavigateToItem }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        // Safety timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 5000);

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            clearTimeout(timeoutId);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AppNotification[];

            // Sort client-side to avoid needing a Firestore composite index
            const sortedData = data.sort((a, b) => {
                const timeA = a.timestamp?.toMillis() || 0;
                const timeB = b.timestamp?.toMillis() || 0;
                return timeB - timeA;
            });

            setNotifications(sortedData);
            setLoading(false);
        }, (error) => {
            console.error("Firestore Notifications error:", error);
            clearTimeout(timeoutId);
            setLoading(false);
        });

        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, [currentUser]);

    const markAsRead = async (notificationId: string) => {
        try {
            await updateDoc(doc(db, 'notifications', notificationId), {
                read: true
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.read);
        if (unread.length === 0) return;

        const batch = writeBatch(db);
        unread.forEach(n => {
            batch.update(doc(db, 'notifications', n.id), { read: true });
        });
        await batch.commit();
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteDoc(doc(db, 'notifications', id));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': return <MessageSquare size={18} className="text-blue-500" />;
            case 'like': return <Heart size={18} className="text-pink-500" />;
            case 'proposal': return <Euro size={18} className="text-orange-500" />;
            case 'system': return <ShieldCheck size={18} className="text-green-500" />;
            default: return <Bell size={18} className="text-gray-500" />;
        }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <header className="sticky top-0 z-20 bg-white border-b border-gray-50 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1 text-[#1D1D4B]">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-[#1D1D4B]">Notifications</h1>
                </div>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-[#FF5722] hover:bg-orange-50 px-3 py-1.5 rounded-full transition-colors"
                    >
                        Tout marquer comme lu
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <div className="w-8 h-8 border-4 border-[#1D1D4B] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-medium">Chargement...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Bell size={40} className="text-gray-200" />
                        </div>
                        <h3 className="text-base font-bold text-[#1D1D4B] mb-2">Aucune notification</h3>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            Vous serez alerté ici des messages, likes et propositions concernant vos annonces.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => {
                                    markAsRead(notif.id);
                                    if (notif.relatedId) onNavigateToItem(notif.type, notif.relatedId);
                                }}
                                className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer group active:scale-[0.98] ${notif.read ? 'bg-white border-gray-50' : 'bg-indigo-50/30 border-indigo-100/50 shadow-sm ring-1 ring-indigo-100/20'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notif.read ? 'bg-gray-50' : 'bg-white shadow-sm'
                                    }`}>
                                    {getIcon(notif.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <h4 className={`text-sm font-bold truncate ${notif.read ? 'text-[#1D1D4B]' : 'text-indigo-900'}`}>
                                            {notif.title}
                                        </h4>
                                        {!notif.read && (
                                            <div className="w-2 h-2 bg-[#FF5722] rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(255,87,34,0.4)]"></div>
                                        )}
                                    </div>
                                    <p className={`text-xs leading-relaxed ${notif.read ? 'text-gray-400 font-medium' : 'text-indigo-800/70 font-semibold'}`}>
                                        {notif.message}
                                    </p>
                                    <span className="text-[10px] text-gray-400 font-bold mt-2 block uppercase tracking-wider">
                                        {notif.timestamp?.toDate().toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => deleteNotification(notif.id, e)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsView;
