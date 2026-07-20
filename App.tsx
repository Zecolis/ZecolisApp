import React, { useState, useEffect } from 'react';
import { View, SearchCriteria, Ad, User } from './types';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import PublishView from './components/PublishView';
import MessagesView from './components/MessagesView';
import ProfileView from './components/ProfileView';
import DetailsView from './components/DetailsView';
import ChatDetailView from './components/ChatDetailView';
import WalletView from './components/WalletView';
import MyAdsView from './components/MyAdsView';
import VerificationView from './components/VerificationView';
import QRCodeView from './components/QRCodeView';
import FavoritesView from './components/FavoritesView';
import PersonalInfoView from './components/PersonalInfoView';
import PublicProfileView from './components/PublicProfileView';
import Onboarding1 from './components/Onboarding1';
import Onboarding2 from './components/Onboarding2';
import Onboarding3 from './components/Onboarding3';
import SplashScreen from './components/SplashScreen';
import RegistrationView from './components/RegistrationView';
import LoginView from './components/LoginView';
import ForgotPasswordView from './components/ForgotPasswordView';
import NotificationsView from './components/NotificationsView';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

// 1) Nouveau flag versionné pour éviter qu'un ancien "seen" bloque l'affichage de l'onboarding.

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.ONBOARDING_1);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashVisible, setSplashVisible] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ name: string, initials: string, rating: number, uid?: string } | null>(null);
  const [publishType, setPublishType] = useState<'colis' | 'voyage'>('colis');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeConversation, setActiveConversation] = useState<{ id: string, name: string, avatar: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // 2) On relit le flag local pour décider si l'utilisateur non connecté doit voir l'onboarding ou la page d'auth.
      if (user) {
        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setCurrentUser({ uid: user.uid, ...userDoc.data() } as User);
        } else {
          // Fallback if user doc doesn't exist yet
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'Utilisateur',
            initials: (user.displayName || 'U').substring(0, 2).toUpperCase(),
            rating: 5.0
          });
        }

        // 3) Si une session existe, on sort immédiatement des écrans publics.
        setCurrentView(View.HOME);
      } else {
        setCurrentUser(null);
        // 4) Si personne n'est connecté, on force l'entrée dans l'onboarding tant qu'il n'a pas été validé.
        setCurrentView(View.ONBOARDING_1);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    // 1) Augmente la durée du splash screen à 5 secondes pour correspondre au design.
    const timer = window.setTimeout(() => setSplashVisible(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  // Listen for global unread count
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const unread = data.unreadCount?.[currentUser.uid] || 0;
        count += unread;
      });
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading || splashVisible) {
    return <SplashScreen />;
  }

  const toggleFavorite = async (adId: string) => {
    if (!currentUser) return;

    // Optimistic update
    setFavorites(prev =>
      prev.includes(adId) ? prev.filter(id => id !== adId) : [...prev, adId]
    );

    try {
      const adRef = doc(db, 'ads', adId);
      const isLiked = favorites.includes(adId);

      if (isLiked) {
        // Unlike
        await updateDoc(adRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        // Like
        await updateDoc(adRef, {
          likes: arrayUnion(currentUser.uid)
        });
      }
    } catch (e) {
      console.error("Error updating like:", e);
      // Revert if error? (optional)
    }
  };

  const handleSearch = (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
    setCurrentView(View.SEARCH);
  };

  const handleSelectAd = (ad: Ad) => {
    setSelectedAd(ad);
    setCurrentView(View.DETAIL);
  };

  const handleSelectUser = (user: { name: string, initials: string, rating: number, uid?: string }) => {
    setSelectedUser(user);
    setCurrentView(View.PUBLIC_PROFILE);
  };

  const startPublish = (type: 'colis' | 'voyage') => {
    setPublishType(type);
    setEditingAd(null);
    setCurrentView(View.PUBLISH);
  };

  const handleEditAd = (ad: any) => {
    const adToEdit: Ad = {
      ...ad,
      userName: 'Loukman ayaba',
      userInitials: 'LA',
      userRating: 5,
      tripsCount: 0,
      price: parseInt(ad.price || '0'),
      weight: ad.weight || '10 kg'
    };
    setEditingAd(adToEdit);
    setCurrentView(View.PUBLISH);
  };

  const handleContact = async (partnerId: string, partnerName: string, partnerAvatar: string) => {
    if (!currentUser) return;

    try {
      // Check if conversation exists
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      let existingConvId = null;

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.participants.includes(partnerId)) {
          existingConvId = doc.id;
        }
      });

      if (existingConvId) {
        handleOpenChat(existingConvId, partnerName, partnerAvatar);
      } else {
        // Create new conversation
        const newConvRef = await addDoc(collection(db, 'conversations'), {
          participants: [currentUser.uid, partnerId],
          participantDetails: {
            [currentUser.uid]: {
              name: currentUser.name,
              avatar: currentUser.initials,
            },
            [partnerId]: {
              name: partnerName,
              avatar: partnerAvatar,
            }
          },
          lastMessage: '',
          lastMessageTimestamp: serverTimestamp(),
          lastSenderId: '',
          unreadCount: {
            [currentUser.uid]: 0,
            [partnerId]: 0
          }
        });
        handleOpenChat(newConvRef.id, partnerName, partnerAvatar);
      }
    } catch (error) {
      console.error("Error handling contact:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setCurrentView(View.ONBOARDING_1);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const completeOnboarding = () => {
    // 5) La dernière étape renvoie vers l'authentification.
    setCurrentView(View.LOGIN);
  };

  const handleOpenChat = (conversationId: string, partnerName: string, partnerAvatar: string) => {
    setActiveConversation({ id: conversationId, name: partnerName, avatar: partnerAvatar });
    setCurrentView(View.CHAT_DETAIL);
  };

  const handleNavigateToItem = (type: string, relatedId: string) => {
    switch (type) {
      case 'message':
      case 'proposal':
        // For message/proposal, we need to know the partner name/avatar.
        // This is a bit tricky without fetching the conv, but we can try to find it in MessagesView data?
        // For now, just go to Messages list or if we have it in activeConversation logic...
        setCurrentView(View.MESSAGES);
        break;
      case 'like':
        // Navigate to the ad detail
        // Fetch ad and call handleSelectAd?
        break;
      default:
        setCurrentView(View.HOME);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.ONBOARDING_1:
        return (
          <Onboarding1
            onNext={() => setCurrentView(View.ONBOARDING_2)}
            onSkip={completeOnboarding}
          />
        );
      case View.ONBOARDING_2:
        return (
          <Onboarding2
            onNext={() => setCurrentView(View.ONBOARDING_3)}
            onSkip={completeOnboarding}
          />
        );
      case View.ONBOARDING_3:
        return (
          <Onboarding3
            onNext={completeOnboarding}
            onSkip={completeOnboarding}
          />
        );
      case View.LOGIN:
        return (
          <LoginView
            onSignUp={() => setCurrentView(View.SIGNUP)}
            onLogin={() => setCurrentView(View.HOME)}
            onForgotPassword={() => setCurrentView(View.FORGOT_PASSWORD)}
          />
        );
      case View.FORGOT_PASSWORD:
        return <ForgotPasswordView onBack={() => setCurrentView(View.LOGIN)} />;
      case View.SIGNUP:
        return <RegistrationView onBack={() => setCurrentView(View.LOGIN)} onSignUp={() => setCurrentView(View.HOME)} />;
      case View.HOME:
        return (
          <HomeView
            currentUser={currentUser}
            onParcelClick={() => startPublish('colis')}
            onTripClick={() => startPublish('voyage')}
            onSelectUser={handleSelectUser}
            onSeeAllRecent={() => setCurrentView(View.SEARCH)}
            onSeeAllTransactions={() => setCurrentView(View.MY_ADS)}
            onSelectAd={handleSelectAd}
            onNotificationClick={() => setCurrentView(View.NOTIFICATIONS)}
            onMessagesClick={() => setCurrentView(View.MESSAGES)}
            onVerifyClick={() => setCurrentView(View.VERIFY_INTRO)}
            unreadCount={unreadCount}
          />
        );
      case View.SEARCH:
        return (
          <SearchView
            initialCriteria={searchCriteria}
            onSelectAd={handleSelectAd}
            onSelectUser={handleSelectUser}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        );
      case View.PUBLISH:
        return (
          <PublishView
            currentUser={currentUser}
            initialType={editingAd ? editingAd.type : publishType}
            editingAd={editingAd}
            onBack={() => setCurrentView(editingAd ? View.MY_ADS : View.HOME)}
            onFindTraveler={handleSearch}
          />
        );
      case View.MESSAGES:
        return <MessagesView onOpenChat={handleOpenChat} />;
      case View.NOTIFICATIONS:
        return (
          <NotificationsView
            currentUser={currentUser}
            onBack={() => setCurrentView(View.HOME)}
            onNavigateToItem={handleNavigateToItem}
          />
        );
      case View.CHAT_DETAIL:
        return activeConversation ? (
          <ChatDetailView
            conversationId={activeConversation.id}
            partnerName={activeConversation.name}
            partnerAvatar={activeConversation.avatar}
            onBack={() => setCurrentView(View.MESSAGES)}
          />
        ) : null;
      case View.PROFILE:
        return (
          <ProfileView
            currentUser={currentUser}
            onNavigate={(view) => setCurrentView(view)}
            onLogout={handleLogout}
          />
        );
      case View.WALLET:
        return <WalletView currentUser={currentUser} onBack={() => setCurrentView(View.PROFILE)} />;
      case View.MY_ADS:
        return <MyAdsView currentUser={currentUser} onBack={() => setCurrentView(View.PROFILE)} onEditAd={handleEditAd} />;
      case View.VERIFY_INTRO:
        return <VerificationView step="intro" onBack={() => setCurrentView(View.PROFILE)} onNext={() => setCurrentView(View.VERIFY_CHOICE)} />;
      case View.VERIFY_CHOICE:
        return <VerificationView step="choice" onBack={() => setCurrentView(View.VERIFY_INTRO)} onNext={() => setCurrentView(View.VERIFY_UPLOAD)} />;
      case View.VERIFY_UPLOAD:
        return <VerificationView step="upload" onBack={() => setCurrentView(View.VERIFY_CHOICE)} onNext={() => setCurrentView(View.PROFILE)} />;
      case View.QR_CODE:
        return <QRCodeView onBack={() => setCurrentView(View.PROFILE)} />;
      case View.FAVORITES:
        return (
          <FavoritesView
            onBack={() => setCurrentView(View.PROFILE)}
            onSelectAd={handleSelectAd}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        );
      case View.PERSONAL_INFO:
        return (
          <PersonalInfoView
            currentUser={currentUser}
            onBack={() => setCurrentView(View.PROFILE)}
            onUpdateUser={(updatedUser) => setCurrentUser(prev => prev ? { ...prev, ...updatedUser } : null)}
          />
        );
      case View.PUBLIC_PROFILE:
        return selectedUser ? (
          <PublicProfileView
            user={selectedUser}
            userId={selectedUser.uid}
            onBack={() => setCurrentView(View.SEARCH)}
            onSelectAd={handleSelectAd}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onContact={() => handleContact(selectedUser.uid || '', selectedUser.name, selectedUser.initials)}
          />
        ) : null;
      case View.DETAIL:
        return selectedAd ? (
          <DetailsView
            ad={selectedAd}
            onBack={() => setCurrentView(View.SEARCH)}
            isFavorite={favorites.includes(selectedAd.id)}
            toggleFavorite={() => toggleFavorite(selectedAd.id)}
            onContact={() => handleContact(selectedAd.userId, selectedAd.userName, selectedAd.userInitials)}
          />
        ) : null;
      default:
        return (
          <HomeView
            currentUser={currentUser}
            onParcelClick={() => startPublish('colis')}
            onTripClick={() => startPublish('voyage')}
            onSelectUser={handleSelectUser}
            onSeeAllRecent={() => setCurrentView(View.SEARCH)}
            onSeeAllTransactions={() => setCurrentView(View.MY_ADS)}
            onSelectAd={handleSelectAd}
            onNotificationClick={() => setCurrentView(View.NOTIFICATIONS)}
            onMessagesClick={() => setCurrentView(View.MESSAGES)}
            onVerifyClick={() => setCurrentView(View.VERIFY_INTRO)}
            unreadCount={unreadCount}
          />
        );
    }
  };

  const hiddenNavViews = [
    View.LOGIN,
    View.SIGNUP,
    View.FORGOT_PASSWORD,
    View.ONBOARDING_1,
    View.ONBOARDING_2,
    View.ONBOARDING_3,
    View.CHAT_DETAIL,
    View.DETAIL,
    View.PUBLISH,
    View.WALLET,
    View.VERIFY_INTRO,
    View.VERIFY_CHOICE,
    View.QR_CODE,
    View.MY_ADS,
    View.FAVORITES,
    View.PERSONAL_INFO,
    View.PUBLIC_PROFILE,
    View.NOTIFICATIONS
  ];
  const showNav = !hiddenNavViews.includes(currentView);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white relative overflow-hidden">
      <main className={`flex-1 overflow-y-auto hide-scrollbar ${showNav ? 'pb-20' : ''}`}>
        {renderView()}
      </main>
      {showNav && <BottomNav currentView={currentView} setView={setCurrentView} unreadCount={unreadCount} />}
    </div>
  );
};

export default App;
