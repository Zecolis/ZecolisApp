import React, { useEffect, useState } from 'react';
import { Search, MoreHorizontal } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Conversation } from '../types';

interface MessagesViewProps {
  onOpenChat: (conversationId: string, partnerName: string, partnerAvatar: string) => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({ onOpenChat }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      setConversations(convs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching conversations: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return <div className="flex items-center justify-center h-full pt-20 text-gray-400">Chargement...</div>;
  }

  return (
    <div className="px-5 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1D1D4B]">Messages</h1>
        <button className="text-gray-400 p-1">
          <MoreHorizontal size={24} />
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Rechercher une discussion..."
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-gray-100 rounded-xl text-sm font-semibold focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        {conversations.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm font-medium">
            Aucune conversation pour le moment.
          </div>
        ) : (
          conversations.map(chat => {
            const partnerId = chat.participants.find(p => p !== currentUser?.uid) || '';
            const partner = chat.participantDetails[partnerId] || { name: 'Utilisateur inconnu', avatar: 'U' };
            const unread = chat.unreadCount[currentUser?.uid || ''] || 0;

            // Format timestamp
            let timeDisplay = '';
            if (chat.lastMessageTimestamp) {
              const date = chat.lastMessageTimestamp.toDate();
              const now = new Date();
              if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                timeDisplay = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else {
                timeDisplay = date.toLocaleDateString();
              }
            }

            return (
              <div
                key={chat.id}
                onClick={() => onOpenChat(chat.id, partner.name, partner.avatar)}
                className="flex items-center gap-4 p-3 active:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="relative">
                  <div className={`w-14 h-14 ${partner.avatar === 'IV' ? 'bg-sky-400 text-white' : 'bg-indigo-100 text-indigo-700'} rounded-full flex items-center justify-center font-bold text-lg bg-indigo-100 text-indigo-700`}>
                    {partner.avatar}
                  </div>
                  {/* Online status not reliable yet without presence system, hiding for now or hardcoding based on something else */}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-[#1D1D4B] truncate">{partner.name}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{timeDisplay}</span>
                  </div>
                  <p className={`text-xs truncate ${unread > 0 ? 'font-black text-[#1D1D4B]' : 'text-gray-400 font-medium'}`}>
                    {chat.lastSenderId === currentUser?.uid ? 'Vous: ' : ''}{chat.lastMessage}
                  </p>
                </div>
                {unread > 0 && (
                  <div className="w-5 h-5 bg-[#FF5722] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {unread}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessagesView;
