import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Euro, Send, X, Plus, Minus, Check, Edit2, Trash2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDoc, increment, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Message } from '../types';

interface ChatDetailViewProps {
  conversationId: string;
  partnerName: string;
  partnerAvatar: string;
  onBack: () => void;
}

const ChatDetailView: React.FC<ChatDetailViewProps> = ({ conversationId, partnerName, partnerAvatar, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showProposal, setShowProposal] = useState(false);
  const [proposalAmount, setProposalAmount] = useState(40);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!conversationId || !currentUser) return;

    // Mark as read when opening chat
    const markAsRead = async () => {
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        [`unreadCount.${currentUser.uid}`]: 0
      });
    };
    markAsRead();

    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !conversationId) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      // Add message to subcollection
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        text,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        type: 'text'
      });

      // Update conversation last message and increment partner's unread count
      const convRef = doc(db, 'conversations', conversationId);
      // We need to identify the partner ID to increment their unread count.
      // Since we don't have partnerId prop directly easily available for keying, 
      // we can use a trick: update all keys that are NOT current user? 
      // or fetch the doc first? Fetching doc is safer.
      const convDoc = await getDoc(convRef);
      if (convDoc.exists()) {
        const data = convDoc.data();
        const participants = data.participants as string[];
        const partnerId = participants.find(p => p !== currentUser.uid);

        if (partnerId) {
          await updateDoc(convRef, {
            lastMessage: text,
            lastMessageTimestamp: serverTimestamp(),
            lastSenderId: currentUser.uid,
            [`unreadCount.${partnerId}`]: increment(1)
          });

          // Create a notification for the partner
          await addDoc(collection(db, 'notifications'), {
            userId: partnerId,
            title: currentUser?.displayName || 'Nouveau message',
            message: text,
            type: 'message',
            read: false,
            relatedId: conversationId,
            timestamp: serverTimestamp()
          });
        }
      }

    } catch (e) {
      console.error("Error sending message: ", e);
      alert("Erreur lors de l'envoi");
    }
  };


  const handleSendProposal = async () => {
    if (!currentUser || !conversationId) return;

    try {
      const convRef = doc(db, 'conversations', conversationId);
      const convDoc = await getDoc(convRef);
      let partnerId = '';
      if (convDoc.exists()) {
        const participants = convDoc.data().participants as string[];
        partnerId = participants.find(p => p !== currentUser.uid) || '';
      }

      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        text: `Proposition: ${proposalAmount}€`,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        type: 'proposal',
        proposalAmount,
        proposalStatus: 'pending'
      });

      await updateDoc(convRef, {
        lastMessage: `Proposition: ${proposalAmount}€`,
        lastMessageTimestamp: serverTimestamp(),
        lastSenderId: currentUser.uid,
        ...(partnerId ? { [`unreadCount.${partnerId}`]: increment(1) } : {})
      });

      if (partnerId) {
        await addDoc(collection(db, 'notifications'), {
          userId: partnerId,
          title: (currentUser as any).displayName || 'Utilisateur',
          message: `Nouvelle proposition de ${proposalAmount}€`,
          type: 'proposal',
          read: false,
          relatedId: conversationId,
          timestamp: serverTimestamp()
        });
      }

      setShowProposal(false);
    } catch (e) {
      console.error("Error sending proposal: ", e);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!conversationId) return;
    if (confirm('Voulez-vous vraiment supprimer ce message ?')) {
      try {
        await deleteDoc(doc(db, 'conversations', conversationId, 'messages', messageId));
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!conversationId || !newText.trim()) return;
    try {
      await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
        text: newText.trim(),
        edited: true
      });
      setEditingMessageId(null);
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-50 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 text-[#1D1D4B]">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-sky-400 rounded-full flex items-center justify-center text-white font-bold text-sm bg-indigo-100 text-indigo-700">
                {partnerAvatar}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-base font-bold text-[#1D1D4B] leading-none">{partnerName}</h1>
              <span className="text-[10px] font-bold text-green-500 uppercase mt-1 block">EN LIGNE</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowProposal(true)}
          className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF5722] shadow-sm active:scale-95 transition-transform"
        >
          <Euro size={20} />
        </button>
      </header>

      {/* Chat Body */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6 bg-white">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.uid;
          // Basic time formatting
          const time = msg.timestamp ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';
          const isByMe = msg.senderId === currentUser?.uid;

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative mb-4 pt-4`}>
              {/* Actions Menu - Positioned above the bubble */}
              {selectedMessageId === msg.id && !editingMessageId && (
                <div
                  className={`absolute -top-8 ${isMe ? 'right-0' : 'left-0'} flex items-center gap-1 bg-white shadow-lg rounded-full px-2 py-1 z-30 animate-fadeIn border border-gray-100`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isByMe ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditing(msg); setSelectedMessageId(null); }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); setSelectedMessageId(null); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); alert("Info message: " + msg.timestamp?.toDate().toLocaleString()); }}
                        className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-full"
                      >
                        <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px] font-bold">i</div>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); setSelectedMessageId(null); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedMessageId(null); }}
                    className="p-1.5 text-gray-400 border-l border-gray-100 ml-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMessageId(selectedMessageId === msg.id ? null : msg.id);
                }}
                className={`${isMe ? 'bg-[#1D1D4B] text-white rounded-t-2xl rounded-bl-2xl' : 'bg-gray-100 text-black rounded-t-2xl rounded-br-2xl'} p-3.5 shadow-sm max-w-[85%] min-w-[80px] transition-all relative cursor-pointer active:scale-[0.99] ${selectedMessageId === msg.id ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}
              >
                {msg.type === 'proposal' ? (
                  <div className="font-bold">
                    Proposition : {msg.proposalAmount}€ <br />
                    <span className="text-[10px] opacity-70 italic">Statut: {msg.proposalStatus}</span>
                  </div>
                ) : (
                  editingMessageId === msg.id ? (
                    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        className="text-black rounded px-2 py-1 w-full text-sm"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => handleEditMessage(msg.id, editText)} className="p-1 bg-white/10 rounded text-green-400 hover:bg-white/20"><Check size={16} /></button>
                      <button onClick={() => setEditingMessageId(null)} className="p-1 bg-white/10 rounded text-red-400 hover:bg-white/20"><X size={16} /></button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium leading-snug">
                      {msg.text}
                      {msg.edited && <span className="text-[9px] opacity-60 italic ml-1">(modifié)</span>}
                    </p>
                  )
                )}

                <div className={`flex items-center justify-end gap-1 mt-1`}>
                  <span className="text-[9px] opacity-60 font-medium">{time}</span>
                  {isMe && <Check size={10} className="opacity-60" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-50 flex items-center gap-3 sticky bottom-0 z-20">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ecrivez votre message..."
          className="flex-1 bg-gray-50 px-5 py-3.5 rounded-xl text-sm font-semibold placeholder:text-gray-400 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-[#1D1D4B] active:scale-95 transition-transform"
        >
          <Send size={20} className="translate-x-0.5" />
        </button>
      </div>

      {/* Proposal Popup */}
      {showProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/10 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-[340px] rounded-[32px] p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setShowProposal(false)}
              className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-500"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-10">
              <Euro size={20} className="text-[#FF5722]" />
              <h3 className="text-sm font-bold text-[#1D1D4B]">Faire une proposition</h3>
            </div>

            <div className="flex items-center justify-between mb-10 px-2">
              <button
                onClick={() => setProposalAmount(prev => Math.max(1, prev - 5))}
                className="w-12 h-12 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm active:bg-gray-50"
              >
                <Minus size={20} />
              </button>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={proposalAmount}
                  onChange={(e) => setProposalAmount(Number(e.target.value))}
                  className="w-28 bg-transparent text-6xl font-bold text-[#FF5722] text-center focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-2xl font-bold text-orange-200 mt-4">€</span>
              </div>

              <button
                onClick={() => setProposalAmount(prev => prev + 5)}
                className="w-12 h-12 rounded-xl border border-gray-100 flex items-center justify-center text-indigo-900 shadow-sm active:bg-gray-50"
              >
                <Plus size={20} />
              </button>
            </div>

            <button
              onClick={handleSendProposal}
              className="w-full h-16 bg-[#FF5722] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 active:scale-[0.98]"
            >
              <Check size={20} />
              Envoyer la proposition
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDetailView;
